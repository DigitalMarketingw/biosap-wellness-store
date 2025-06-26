
export function generateMerchantTransactionId(): string {
  return `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
}

export function formatPhoneNumber(phone: string): string {
  return phone?.replace(/\D/g, '').substring(0, 10) || '';
}

export function cleanMerchantUserId(userId: string): string {
  return `USER${userId.replace(/-/g, '').substring(0, 8)}`;
}

export async function generateChecksum(payload: string, endpoint: string, saltKey: string, saltIndex: string): Promise<string> {
  const stringToHash = payload + endpoint + saltKey;
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToHash);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  const checksum = Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('') + '###' + saltIndex;
  
  return checksum;
}

export function getPhonePeApiUrl(endpoint: string): string {
  const isProduction = Deno.env.get('PHONEPE_ENV') === 'production';
  const baseUrl = isProduction 
    ? 'https://api.phonepe.com/apis/hermes/pg/v1'
    : 'https://api-preprod.phonepe.com/apis/hermes/pg/v1';
  
  return `${baseUrl}${endpoint}`;
}

export function getFrontendUrl(req: Request): string {
  return req.headers.get('origin') || 'https://heawuwxajoduoqumycxd.supabase.co';
}
