
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
    console.error('PhonePe payment error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

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
  
  // PhonePe payment request
  const paymentRequest = {
    merchantId: Deno.env.get('PHONEPE_MERCHANT_ID'),
    merchantTransactionId,
    merchantUserId: userId,
    amount: Math.round(order.total_amount * 100), // Convert to paise
    redirectUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/phonepe-payment/callback`,
    redirectMode: 'POST',
    callbackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/phonepe-payment/callback`,
    mobileNumber: order.shipping_address?.phone || '',
    paymentInstrument: {
      type: 'PAY_PAGE'
    }
  }

  // Create base64 encoded payload
  const base64Payload = btoa(JSON.stringify(paymentRequest))
  
  // Create checksum
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

  // Make request to PhonePe
  const phonePeUrl = Deno.env.get('PHONEPE_ENV') === 'production' 
    ? 'https://api.phonepe.com/apis/hermes/pg/v1/pay'
    : 'https://api-preprod.phonepe.com/apis/hermes/pg/v1/pay'

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
    return new Response(
      JSON.stringify({ error: 'Failed to initiate payment', details: result }),
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

  const phonePeUrl = Deno.env.get('PHONEPE_ENV') === 'production' 
    ? `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`
    : `https://api-preprod.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`

  const response = await fetch(phonePeUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
      'X-MERCHANT-ID': merchantId
    }
  })

  const result = await response.json()

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
    const { error: orderUpdateError } = await supabaseClient
      .from('orders')
      .update({
        payment_status: 'completed',
        status: 'processing',
        transaction_reference: result.data.transactionId,
        payment_completed_at: new Date().toISOString()
      })
      .eq('id', result.data?.merchantTransactionId)

    if (orderUpdateError) {
      console.error('Error updating order:', orderUpdateError)
    }
  }

  return new Response(
    JSON.stringify(result),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}
