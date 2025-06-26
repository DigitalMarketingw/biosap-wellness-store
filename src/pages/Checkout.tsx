import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { usePhonePePayment } from '@/hooks/usePhonePePayment';

const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const { initiatePayment, isProcessing: isPhonePeProcessing } = usePhonePePayment();
  
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const createOrder = async () => {
    console.log('Checkout - Starting order creation...');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('Checkout - User not authenticated');
      throw new Error('User not authenticated');
    }

    console.log('Checkout - Creating order for user:', user.id);
    console.log('Checkout - Order data:', {
      user_id: user.id,
      total_amount: getTotalPrice(),
      shipping_address: shippingInfo,
      payment_method: paymentMethod,
      items: items
    });

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: getTotalPrice(),
        status: 'pending',
        shipping_address: shippingInfo,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Checkout - Order creation error:', orderError);
      throw orderError;
    }

    console.log('Checkout - Order created successfully:', order);

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product.price
    }));

    console.log('Checkout - Creating order items:', orderItems);

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Checkout - Order items creation error:', itemsError);
      throw itemsError;
    }

    console.log('Checkout - Order items created successfully');
    return order;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Checkout - Form submitted, payment method:', paymentMethod);
    setIsProcessing(true);

    try {
      // Validate form data
      if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.email || 
          !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city || 
          !shippingInfo.state || !shippingInfo.pincode) {
        throw new Error('Please fill in all required shipping information');
      }

      const order = await createOrder();
      console.log('Checkout - Order created, ID:', order.id);

      if (paymentMethod === 'online') {
        console.log('Checkout - Initiating PhonePe payment for order:', order.id);
        
        // Add a small delay to ensure order is properly committed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const paymentResult = await initiatePayment(order.id);
        console.log('Checkout - Payment initiation result:', paymentResult);
        
        if (!paymentResult.success) {
          console.error('Checkout - Payment initiation failed');
          throw new Error('Failed to initiate PhonePe payment');
        }
        
        console.log('Checkout - Payment initiated successfully, redirecting...');
        // The user will be redirected to PhonePe, so we don't need to do anything else here
        return;
      } else {
        // Cash on Delivery
        console.log('Checkout - COD order placed successfully');
        await clearCart();

        toast({
          title: "Order placed successfully!",
          description: `Your order #${order.id.slice(0, 8)} has been placed`,
        });

        navigate('/');
      }
    } catch (error) {
      console.error('Checkout - Error placing order:', error);
      
      // More detailed error handling
      let errorMessage = "Failed to place order. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        if ('message' in error) {
          errorMessage = String((error as any).message);
        } else if ('details' in error) {
          errorMessage = String((error as any).details);
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-4">Your cart is empty</h2>
          <p className="text-green-600 mb-8">Add some products to proceed with checkout.</p>
          <Button onClick={() => navigate('/products')} className="bg-green-600 hover:bg-green-700">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-800 mb-8">Checkout</h1>
      
      <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="text-green-800">Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={shippingInfo.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    className="border-green-200"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={shippingInfo.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    className="border-green-200"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={shippingInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="border-green-200"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={shippingInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  className="border-green-200"
                />
              </div>
              
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={shippingInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                  className="border-green-200"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={shippingInfo.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                    className="border-green-200"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={shippingInfo.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    required
                    className="border-green-200"
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={shippingInfo.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    required
                    className="border-green-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="text-green-800">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-green-600"
                  />
                  <div className="flex-1">
                    <span className="font-medium">Cash on Delivery</span>
                    <p className="text-sm text-gray-600">Pay when your order arrives</p>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-green-600"
                  />
                  <div className="flex-1">
                    <span className="font-medium">PhonePe Payment</span>
                    <p className="text-sm text-gray-600">Pay securely with PhonePe, UPI, Cards & more</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-6 bg-purple-600 rounded text-white text-xs flex items-center justify-center font-bold">
                      Pe
                    </div>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-green-100 sticky top-4">
            <CardHeader>
              <CardTitle className="text-green-800">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-sm">{item.product.name} × {item.quantity}</span>
                  <span className="text-sm">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{getTotalPrice().toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-green-800">₹{getTotalPrice().toFixed(2)}</span>
              </div>
              
              <Button
                type="submit"
                disabled={isProcessing || isPhonePeProcessing}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isProcessing || isPhonePeProcessing 
                  ? (paymentMethod === 'online' ? 'Processing Payment...' : 'Processing Order...') 
                  : (paymentMethod === 'online' ? 'Pay with PhonePe' : 'Place Order')
                }
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
