
import { PhonePePaymentRequest, PhonePeResponse } from './types.ts';
import { generateChecksum, getPhonePeApiUrl } from './utils.ts';

export async function initiatePhonePePayment(
  paymentRequest: PhonePePaymentRequest
): Promise<PhonePeResponse> {
  const base64Payload = btoa(JSON.stringify(paymentRequest));
  const saltKey = Deno.env.get('PHONEPE_SALT_KEY')!;
  const saltIndex = Deno.env.get('PHONEPE_SALT_INDEX') || '1';
  
  const checksum = await generateChecksum(base64Payload, '/pg/v1/pay', saltKey, saltIndex);
  
  console.log('PhonePe PG - Payment Request:', paymentRequest);
  console.log('PhonePe PG - Generated checksum:', checksum);

  const phonePeUrl = getPhonePeApiUrl('/pay');
  console.log('PhonePe PG - Making request to:', phonePeUrl);

  const response = await fetch(phonePeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
      'accept': 'application/json'
    },
    body: JSON.stringify({
      request: base64Payload
    })
  });

  const result = await response.json();
  console.log('PhonePe PG - API Response Status:', response.status);
  console.log('PhonePe PG - API Response:', result);

  return result;
}

export async function verifyPhonePePayment(
  merchantTransactionId: string
): Promise<PhonePeResponse> {
  const saltKey = Deno.env.get('PHONEPE_SALT_KEY')!;
  const saltIndex = Deno.env.get('PHONEPE_SALT_INDEX') || '1';
  const merchantId = Deno.env.get('PHONEPE_MERCHANT_ID')!;
  
  const endpoint = `/pg/v1/status/${merchantId}/${merchantTransactionId}`;
  const checksum = await generateChecksum('', endpoint, saltKey, saltIndex);

  const phonePeUrl = getPhonePeApiUrl(endpoint);
  console.log('PhonePe PG - Verifying payment:', phonePeUrl);

  const response = await fetch(phonePeUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
      'X-MERCHANT-ID': merchantId,
      'accept': 'application/json'
    }
  });

  const result = await response.json();
  console.log('PhonePe PG - Verification Response:', result);

  return result;
}
