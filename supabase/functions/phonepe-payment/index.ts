
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const pathname = url.pathname

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Handle callback from PhonePe PG
    if (pathname.includes('/callback')) {
      return await handleCallback(req, supabaseClient)
    }

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { action, orderId, transactionId } = await req.json()

    if (action === 'initiate') {
      return await initiatePayment(supabaseClient, orderId, user.id)
    } else if (action === 'verify') {
      return await verifyPayment(supabaseClient, transactionId)
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('PhonePe PG payment error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function handleCallback(req: Request, supabaseClient: any) {
  const url = new URL(req.url)
  console.log('PhonePe PG Callback received:', req.method, url.pathname, url.search)

  try {
    if (req.method === 'POST') {
      // Handle POST callback from PhonePe PG
      const formData = await req.formData()
      const response = formData.get('response')
      
      console.log('PhonePe PG POST Callback Data:', response)

      if (response) {
        // Decode the base64 response
        const decodedResponse = JSON.parse(atob(response.toString()))
        console.log('Decoded PhonePe Response:', decodedResponse)

        const merchantTransactionId = decodedResponse.data?.merchantTransactionId
        const paymentStatus = decodedResponse.data?.state

        if (merchantTransactionId) {
          // Update payment transaction
          await supabaseClient
            .from('payment_transactions')
            .update({
              status: paymentStatus === 'COMPLETED' ? 'completed' : 'failed',
              phonepe_response: decodedResponse,
              phonepe_transaction_id: decodedResponse.data?.transactionId
            })
            .eq('merchant_transaction_id', merchantTransactionId)

          // Update order if payment successful
          if (paymentStatus === 'COMPLETED') {
            const { data: transaction } = await supabaseClient
              .from('payment_transactions')
              .select('order_id')
              .eq('merchant_transaction_id', merchantTransactionId)
              .single()

            if (transaction) {
              await supabaseClient
                .from('orders')
                .update({
                  payment_status: 'completed',
                  status: 'processing',
                  transaction_reference: decodedResponse.data?.transactionId,
                  payment_completed_at: new Date().toISOString()
                })
                .eq('id', transaction.order_id)
            }
          }

          // Redirect to appropriate page
          const redirectUrl = paymentStatus === 'COMPLETED' 
            ? `https://heawuwxajoduoqumycxd.supabase.co/payment-success?merchantTransactionId=${merchantTransactionId}`
            : `https://heawuwxajoduoqumycxd.supabase.co/payment-failed?merchantTransactionId=${merchantTransactionId}`

          return new Response(null, {
            status: 302,
            headers: {
              'Location': redirectUrl,
              ...corsHeaders
            }
          })
        }
      }
    }

    // Handle GET callback (fallback)
    const merchantTransactionId = url.searchParams.get('merchantTransactionId')
    if (merchantTransactionId) {
      const redirectUrl = `https://heawuwxajoduoqumycxd.supabase.co/payment-success?merchantTransactionId=${merchantTransactionId}`
      return new Response(null, {
        status: 302,
        headers: {
          'Location': redirectUrl,
          ...corsHeaders
        }
      })
    }

    return new Response('Callback processed', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    })
  } catch (error) {
    console.error('Callback handling error:', error)
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `https://heawuwxajoduoqumycxd.supabase.co/payment-failed`,
        ...corsHeaders
      }
    })
  }
}

async function initiatePayment(supabaseClient: any, orderId: string, userId: string) {
  // Get order details
  const { data: order, error: orderError } = await supabaseClient
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single()

  if (orderError || !order) {
    return new Response(
      JSON.stringify({ error: 'Order not found' }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  // Generate merchant transaction ID
  const merchantTransactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`
  
  // PhonePe PG payment request - correct structure according to documentation
  const paymentRequest = {
    merchantId: Deno.env.get('PHONEPE_MERCHANT_ID'),
    merchantTransactionId,
    merchantUserId: userId,
    amount: Math.round(order.total_amount * 100), // Amount in paise
    redirectUrl: `https://heawuwxajoduoqumycxd.supabase.co/payment-success?merchantTransactionId=${merchantTransactionId}`,
    redirectMode: 'POST',
    callbackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/phonepe-payment/callback`,
    mobileNumber: order.shipping_address?.phone || '',
    paymentInstrument: {
      type: 'PAY_PAGE'
    }
  }

  console.log('Payment Request:', paymentRequest)

  // Create base64 encoded payload
  const base64Payload = btoa(JSON.stringify(paymentRequest))
  
  // Create checksum for PhonePe PG
  const saltKey = Deno.env.get('PHONEPE_SALT_KEY')
  const saltIndex = Deno.env.get('PHONEPE_SALT_INDEX') || '1'
  const stringToHash = base64Payload + '/pg/v1/pay' + saltKey
  
  const encoder = new TextEncoder()
  const data = encoder.encode(stringToHash)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = new Uint8Array(hashBuffer)
  const checksum = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('') + '###' + saltIndex

  // Store payment transaction
  const { error: transactionError } = await supabaseClient
    .from('payment_transactions')
    .insert({
      order_id: orderId,
      merchant_transaction_id: merchantTransactionId,
      amount: order.total_amount,
      status: 'pending'
    })

  if (transactionError) {
    console.error('Error storing transaction:', transactionError)
    return new Response(
      JSON.stringify({ error: 'Failed to create transaction' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  // PhonePe PG API endpoint
  const phonePeUrl = Deno.env.get('PHONEPE_ENV') === 'production' 
    ? 'https://api.phonepe.com/apis/hermes/pg/v1/pay'
    : 'https://api-preprod.phonepe.com/apis/hermes/pg/v1/pay'

  console.log('Making request to PhonePe PG:', phonePeUrl)
  console.log('Payload:', base64Payload)
  console.log('Checksum:', checksum)

  const response = await fetch(phonePeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': checksum
    },
    body: JSON.stringify({
      request: base64Payload
    })
  })

  const result = await response.json()
  console.log('PhonePe PG Response:', result)

  if (result.success && result.data?.instrumentResponse?.redirectInfo?.url) {
    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: result.data.instrumentResponse.redirectInfo.url,
        merchantTransactionId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } else {
    console.error('PhonePe PG Error:', result)
    return new Response(
      JSON.stringify({ error: 'Failed to initiate payment with PhonePe PG', details: result }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}

async function verifyPayment(supabaseClient: any, merchantTransactionId: string) {
  const saltKey = Deno.env.get('PHONEPE_SALT_KEY')
  const saltIndex = Deno.env.get('PHONEPE_SALT_INDEX') || '1'
  const merchantId = Deno.env.get('PHONEPE_MERCHANT_ID')
  
  const stringToHash = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + saltKey
  
  const encoder = new TextEncoder()
  const data = encoder.encode(stringToHash)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = new Uint8Array(hashBuffer)
  const checksum = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('') + '###' + saltIndex

  // PhonePe PG status check endpoint
  const phonePeUrl = Deno.env.get('PHONEPE_ENV') === 'production' 
    ? `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`
    : `https://api-preprod.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`

  console.log('Verifying payment with PhonePe PG:', phonePeUrl)

  const response = await fetch(phonePeUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
      'X-MERCHANT-ID': merchantId
    }
  })

  const result = await response.json()
  console.log('PhonePe PG Verification Response:', result)

  // Update payment transaction
  const { error: updateError } = await supabaseClient
    .from('payment_transactions')
    .update({
      phonepe_transaction_id: result.data?.transactionId,
      status: result.success && result.data?.state === 'COMPLETED' ? 'completed' : 'failed',
      phonepe_response: result
    })
    .eq('merchant_transaction_id', merchantTransactionId)

  if (updateError) {
    console.error('Error updating transaction:', updateError)
  }

  // Update order if payment successful
  if (result.success && result.data?.state === 'COMPLETED') {
    // Get the order_id from payment_transactions table
    const { data: transaction } = await supabaseClient
      .from('payment_transactions')
      .select('order_id')
      .eq('merchant_transaction_id', merchantTransactionId)
      .single()

    if (transaction) {
      const { error: orderUpdateError } = await supabaseClient
        .from('orders')
        .update({
          payment_status: 'completed',
          status: 'processing',
          transaction_reference: result.data.transactionId,
          payment_completed_at: new Date().toISOString()
        })
        .eq('id', transaction.order_id)

      if (orderUpdateError) {
        console.error('Error updating order:', orderUpdateError)
      }
    }
  }

  return new Response(
    JSON.stringify(result),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}
