
import { updatePaymentTransaction, updateOrderStatus, getOrderIdFromTransaction } from './database.ts';
import { getFrontendUrl } from './utils.ts';

export async function handleCallback(req: Request, supabaseClient: any) {
  const url = new URL(req.url);
  console.log('PhonePe PG Callback received:', req.method, url.pathname, url.search);

  try {
    if (req.method === 'POST') {
      const formData = await req.formData();
      const response = formData.get('response');
      
      console.log('PhonePe PG POST Callback Data:', response);

      if (response) {
        const decodedResponse = JSON.parse(atob(response.toString()));
        console.log('Decoded PhonePe Response:', decodedResponse);

        const merchantTransactionId = decodedResponse.data?.merchantTransactionId;
        const paymentStatus = decodedResponse.data?.state;

        if (merchantTransactionId) {
          // Update payment transaction
          await updatePaymentTransaction(supabaseClient, merchantTransactionId, {
            status: paymentStatus === 'COMPLETED' ? 'completed' : 'failed',
            phonepe_response: decodedResponse,
            phonepe_transaction_id: decodedResponse.data?.transactionId
          });

          // Update order if payment successful
          if (paymentStatus === 'COMPLETED') {
            const orderId = await getOrderIdFromTransaction(supabaseClient, merchantTransactionId);
            if (orderId) {
              await updateOrderStatus(supabaseClient, orderId, decodedResponse.data?.transactionId);
            }
          }

          const frontendUrl = getFrontendUrl(req);
          const redirectUrl = paymentStatus === 'COMPLETED' 
            ? `${frontendUrl}/payment-success?merchantTransactionId=${merchantTransactionId}`
            : `${frontendUrl}/payment-failed?merchantTransactionId=${merchantTransactionId}`;

          return new Response(null, {
            status: 302,
            headers: {
              'Location': redirectUrl,
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
            }
          });
        }
      }
    }

    // Handle GET callback (fallback)
    const merchantTransactionId = url.searchParams.get('merchantTransactionId');
    if (merchantTransactionId) {
      const frontendUrl = getFrontendUrl(req);
      const redirectUrl = `${frontendUrl}/payment-success?merchantTransactionId=${merchantTransactionId}`;
      return new Response(null, {
        status: 302,
        headers: {
          'Location': redirectUrl,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
        }
      });
    }

    return new Response('Callback processed', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Content-Type': 'text/plain'
      }
    });
  } catch (error) {
    console.error('Callback handling error:', error);
    const frontendUrl = getFrontendUrl(req);
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${frontendUrl}/payment-failed`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  }
}
