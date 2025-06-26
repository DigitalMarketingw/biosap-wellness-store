
import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { usePhonePePayment } from '@/hooks/usePhonePePayment';
import ShippingForm from '@/components/checkout/ShippingForm';
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector';
import OrderSummary from '@/components/checkout/OrderSummary';

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
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!shippingInfo.firstName.trim()) errors.firstName = 'First name is required';
    if (!shippingInfo.lastName.trim()) errors.lastName = 'Last name is required';
    if (!shippingInfo.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) errors.email = 'Email is invalid';
    if (!shippingInfo.phone.trim()) errors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(shippingInfo.phone.replace(/\D/g, ''))) errors.phone = 'Phone must be 10 digits';
    if (!shippingInfo.address.trim()) errors.address = 'Address is required';
    if (!shippingInfo.city.trim()) errors.city = 'City is required';
    if (!shippingInfo.state.trim()) errors.state = 'State is required';
    if (!shippingInfo.pincode.trim()) errors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(shippingInfo.pincode)) errors.pincode = 'Pincode must be 6 digits';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createOrder = async () => {
    console.log('Checkout - Starting order creation...');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('Checkout - User not authenticated');
      throw new Error('User not authenticated');
    }

    console.log('Checkout - Creating order for user:', user.id);
    
    // Clean and format shipping info
    const cleanShippingInfo = {
      ...shippingInfo,
      phone: shippingInfo.phone.replace(/\D/g, ''), // Remove non-digits
      email: shippingInfo.email.toLowerCase().trim(),
      firstName: shippingInfo.firstName.trim(),
      lastName: shippingInfo.lastName.trim(),
      address: shippingInfo.address.trim(),
      city: shippingInfo.city.trim(),
      state: shippingInfo.state.trim(),
      pincode: shippingInfo.pincode.trim()
    };

    console.log('Checkout - Clean shipping info:', cleanShippingInfo);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: getTotalPrice(),
        status: 'pending',
        shipping_address: cleanShippingInfo,
        payment_method: paymentMethod,
        payment_status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Checkout - Order creation error:', orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
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
      // Try to clean up the order if items creation fails
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    console.log('Checkout - Order items created successfully');
    return order;
  };

  const handlePlaceOrder = async () => {
    console.log('Checkout - Form submitted, payment method:', paymentMethod);
    
    // Validate form first
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const order = await createOrder();
      console.log('Checkout - Order created, ID:', order.id);

      if (paymentMethod === 'online') {
        console.log('Checkout - Initiating PhonePe payment for order:', order.id);
        
        // Add a delay to ensure order is fully committed to database
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const paymentResult = await initiatePayment(order.id);
        console.log('Checkout - Payment initiation result:', paymentResult);
        
        if (!paymentResult.success) {
          console.error('Checkout - Payment initiation failed');
          throw new Error('Failed to initiate PhonePe payment. Please try again.');
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
      
      let errorMessage = "Failed to place order. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
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
      
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <ShippingForm
            shippingInfo={shippingInfo}
            validationErrors={validationErrors}
            onInputChange={handleInputChange}
          />

          <PaymentMethodSelector
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
          />
        </div>

        <div>
          <OrderSummary
            items={items}
            totalPrice={getTotalPrice()}
            paymentMethod={paymentMethod}
            isProcessing={isProcessing}
            isPhonePeProcessing={isPhonePeProcessing}
            onSubmit={handlePlaceOrder}
          />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
