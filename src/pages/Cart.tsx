
import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="h-24 w-24 text-green-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-green-800 mb-4">Your cart is empty</h2>
          <p className="text-green-600 mb-8">
            Discover our natural Ayurvedic products and start your wellness journey.
          </p>
          <Link to="/products">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Shop Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-800 mb-8">Shopping Cart</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="border-green-100">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <img
                    src={item.product.image_urls?.[0] || '/placeholder.svg'}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  
                  <div className="flex-grow">
                    <h3 className="font-semibold text-green-800 mb-2">{item.product.name}</h3>
                    <p className="text-green-600 text-lg font-bold mb-4">
                      ₹{item.product.price}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="h-8 w-8 border-green-300"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="h-8 w-8 border-green-300"
                          disabled={item.product.stock !== null && item.quantity >= item.product.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.product_id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-800">
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="lg:col-span-1">
          <Card className="border-green-100 sticky top-4">
            <CardHeader>
              <CardTitle className="text-green-800">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Items ({getTotalItems()})</span>
                <span>₹{getTotalPrice().toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-800">₹{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
              
              <Link to="/checkout" className="block">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Proceed to Checkout
                </Button>
              </Link>
              
              <Link to="/products" className="block">
                <Button variant="outline" className="w-full border-green-300 text-green-700">
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
