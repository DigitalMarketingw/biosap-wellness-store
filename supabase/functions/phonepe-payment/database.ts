
import { Order } from './types.ts';

export async function fetchOrderWithRetry(
  supabaseClient: any, 
  orderId: string, 
  userId: string, 
  maxAttempts: number = 3
): Promise<Order | null> {
  let order = null;
  let attempts = 0;

  while (!order && attempts < maxAttempts) {
    attempts++;
    console.log(`PhonePe PG - Fetching order attempt ${attempts}/${maxAttempts}`);
    
    const { data, error } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error(`PhonePe PG - Order fetch error (attempt ${attempts}):`, error);
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } else {
      order = data;
      console.log('PhonePe PG - Order found:', order);
    }
  }

  return order;
}

export async function createPaymentTransaction(
  supabaseClient: any,
  orderId: string,
  merchantTransactionId: string,
  amount: number
): Promise<{ success: boolean; error?: any }> {
  const { error } = await supabaseClient
    .from('payment_transactions')
    .insert({
      order_id: orderId,
      merchant_transaction_id: merchantTransactionId,
      amount: amount,
      status: 'pending'
    });

  if (error) {
    console.error('PhonePe PG - Error storing transaction:', error);
    return { success: false, error };
  }

  return { success: true };
}

export async function updatePaymentTransaction(
  supabaseClient: any,
  merchantTransactionId: string,
  updates: any
): Promise<void> {
  await supabaseClient
    .from('payment_transactions')
    .update(updates)
    .eq('merchant_transaction_id', merchantTransactionId);
}

export async function updateOrderStatus(
  supabaseClient: any,
  orderId: string,
  transactionId: string
): Promise<void> {
  await supabaseClient
    .from('orders')
    .update({
      payment_status: 'completed',
      status: 'processing',
      transaction_reference: transactionId,
      payment_completed_at: new Date().toISOString()
    })
    .eq('id', orderId);
}

export async function getOrderIdFromTransaction(
  supabaseClient: any,
  merchantTransactionId: string
): Promise<string | null> {
  const { data: transaction } = await supabaseClient
    .from('payment_transactions')
    .select('order_id')
    .eq('merchant_transaction_id', merchantTransactionId)
    .single();

  return transaction?.order_id || null;
}
