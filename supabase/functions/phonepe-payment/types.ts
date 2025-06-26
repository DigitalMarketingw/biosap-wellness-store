
export interface PhonePePaymentRequest {
  merchantId: string;
  merchantTransactionId: string;
  merchantUserId: string;
  amount: number;
  redirectUrl: string;
  redirectMode: string;
  callbackUrl: string;
  mobileNumber: string;
  paymentInstrument: {
    type: string;
  };
  deviceContext: {
    deviceOS: string;
  };
  expiresIn: number;
}

export interface PhonePeResponse {
  success: boolean;
  code?: string;
  message?: string;
  data?: {
    merchantId: string;
    merchantTransactionId: string;
    transactionId: string;
    amount: number;
    state: string;
    responseCode: string;
    paymentInstrument?: {
      type: string;
    };
    instrumentResponse?: {
      redirectInfo?: {
        url: string;
        method: string;
      };
    };
  };
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  shipping_address: {
    phone?: string;
    [key: string]: any;
  };
  status: string;
  payment_status: string;
}
