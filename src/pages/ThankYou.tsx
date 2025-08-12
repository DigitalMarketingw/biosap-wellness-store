
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Clock, Phone, Mail, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image_urls: string[] | null;
    price: number;
  };
}

interface Order {
  id: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  transaction_reference: string | null;
  shipping_address: any;
  created_at: string;
  order_items: OrderItem[];
}

const ThankYou = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('orderId');
  const merchantTransactionId = searchParams.get('merchantTransactionId');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId && !merchantTransactionId) {
        setError('Order information not found');
        setIsLoading(false);
        return;
      }

      try {
        let orderQuery = supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              product:products (*)
            )
          `);

        if (orderId) {
          orderQuery = orderQuery.eq('id', orderId);
        } else if (merchantTransactionId) {
          // Find order by transaction reference
          orderQuery = orderQuery.eq('transaction_reference', merchantTransactionId);
        }

        const { data: orderData, error: orderError } = await orderQuery.single();

        if (orderError || !orderData) {
          throw new Error('Order not found');
        }

        setOrder(orderData);
        await clearCart();
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Unable to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, merchantTransactionId, clearCart]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading your order details...</h2>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-red-600 mb-4">
            <Package className="w-12 h-12 mx-auto mb-4" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  const shipping = order.shipping_address as any;
  const customerName = shipping && typeof shipping === 'object' 
    ? `${shipping.firstName || ''} ${shipping.lastName || ''}`.trim()
    : 'Valued Customer';

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-green-800 mb-2">Thank You for Shopping with BIOSAP!</h1>
          <p className="text-xl text-gray-600">
            Hi {customerName}, your order has been successfully placed and confirmed.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-green-800">Order Number:</span>
                  <span className="font-mono text-sm">#{order.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-green-800">Order Date:</span>
                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">Items Ordered:</h3>
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      {item.product.image_urls && item.product.image_urls[0] ? (
                        <img
                          src={item.product.image_urls[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold text-green-800">
                  <span>Total Amount:</span>
                  <span>₹{order.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                  <span>Payment Method:</span>
                  <span className="capitalize">{order.payment_method === 'online' ? 'Razorpay' : 'Cash on Delivery'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery & Next Steps */}
          <div className="space-y-6">
            {/* Delivery Information */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Estimated Delivery</h3>
                    <p className="text-lg font-medium">{estimatedDelivery.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                    <p className="text-sm text-gray-600 mt-1">Within 5-7 business days</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Shipping Address</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{customerName}</p>
                      <p>{shipping?.address}</p>
                      <p>{shipping?.city}, {shipping?.state} {shipping?.pincode}</p>
                      {shipping?.phone && <p>Phone: {shipping.phone}</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">What's Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-green-600">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Order Confirmation</p>
                      <p className="text-sm text-gray-600">We'll send you an email confirmation shortly</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-green-600">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Processing & Packaging</p>
                      <p className="text-sm text-gray-600">Your order will be carefully prepared</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-green-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Shipping & Tracking</p>
                      <p className="text-sm text-gray-600">You'll receive tracking details once shipped</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Support */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Call Us</p>
                      <p className="text-sm text-gray-600">+91 9599519312</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Email Support</p>
                      <p className="text-sm text-gray-600">plantsmedg@gmail.com</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-wrap gap-4 justify-center">
          <Button 
            onClick={() => navigate('/profile')} 
            className="bg-green-600 hover:bg-green-700"
          >
            View Order History
          </Button>
          <Button 
            onClick={() => navigate('/products')} 
            variant="outline" 
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            Continue Shopping
          </Button>
          <Button 
            onClick={() => navigate('/contact')} 
            variant="outline"
          >
            Contact Support
          </Button>
        </div>

        {/* Thank You Message */}
        <div className="mt-12 text-center bg-green-50 p-8 rounded-lg">
          <Heart className="w-8 h-8 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">Thank You for Choosing BIOSAP</h2>
          <p className="text-gray-600">
            We appreciate your trust in our organic products. Your health and satisfaction are our top priorities!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
