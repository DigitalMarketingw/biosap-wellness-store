
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Clock, MapPin, Package } from 'lucide-react';

const ShippingDelivery = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Hero Section */}
      <div className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Shipping & Delivery</h1>
          <p className="text-xl text-green-100">
            Fast and reliable delivery of your wellness products
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Delivery Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800 flex items-center gap-2">
                <Clock className="h-6 w-6" />
                Delivery Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">2-7 Days</div>
                  <p className="text-green-800 font-semibold text-lg">Standard Delivery Time</p>
                  <p className="text-green-700 mt-2">
                    Most orders are delivered within 2-7 business days across India
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Metro Cities</h4>
                  <p className="text-blue-700">2-4 business days</p>
                  <p className="text-sm text-blue-600">Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Other Cities</h4>
                  <p className="text-purple-700">4-7 business days</p>
                  <p className="text-sm text-purple-600">Tier 2 & Tier 3 cities and towns</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Processing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800 flex items-center gap-2">
                <Package className="h-6 w-6" />
                Order Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Your order goes through the following stages:
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 rounded-full p-2 mt-1">
                    <span className="text-green-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Order Confirmation</h4>
                    <p className="text-gray-700">Immediate email confirmation after successful payment</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 rounded-full p-2 mt-1">
                    <span className="text-green-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Processing</h4>
                    <p className="text-gray-700">1-2 business days for order preparation and quality check</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 rounded-full p-2 mt-1">
                    <span className="text-green-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Dispatch</h4>
                    <p className="text-gray-700">Order shipped with tracking number provided via email/SMS</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 rounded-full p-2 mt-1">
                    <span className="text-green-600 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Delivery</h4>
                    <p className="text-gray-700">Package delivered to your doorstep with delivery confirmation</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Coverage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800 flex items-center gap-2">
                <MapPin className="h-6 w-6" />
                Shipping Coverage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We currently deliver to most locations across India:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">500+</div>
                  <p className="text-green-800 font-semibold">Cities Covered</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">25+</div>
                  <p className="text-blue-800 font-semibold">States & UTs</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">10000+</div>
                  <p className="text-purple-800 font-semibold">Pin Codes</p>
                </div>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <p className="text-amber-800">
                  <strong>Note:</strong> Some remote areas may experience longer delivery times. 
                  We'll notify you if your area requires additional time.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Charges */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800 flex items-center gap-2">
                <Truck className="h-6 w-6" />
                Shipping Charges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">FREE SHIPPING</div>
                  <p className="text-green-800 font-semibold">on orders above ₹499</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Orders below ₹499</span>
                  <span className="font-semibold text-gray-800">₹49 shipping fee</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Express Delivery (1-2 days)</span>
                  <span className="font-semibold text-gray-800">₹99 additional</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">Delivery Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Delivery is attempted during business hours (9 AM - 7 PM)</li>
                <li>A valid ID proof may be required at the time of delivery</li>
                <li>If you're not available, we'll attempt delivery up to 3 times</li>
                <li>Packages will be returned to our warehouse after failed delivery attempts</li>
                <li>Re-delivery charges may apply for returned packages</li>
                <li>Please ensure your address and contact details are accurate</li>
                <li>Delivery times may vary during festivals and adverse weather conditions</li>
              </ul>
            </CardContent>
          </Card>

          {/* Order Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">Order Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Stay updated on your order status:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Track your order using the tracking number sent via email/SMS</li>
                <li>Log into your account to view real-time order status</li>
                <li>Receive notifications at key delivery milestones</li>
                <li>Contact customer support for any tracking issues</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">Shipping Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                For shipping-related queries, contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> shipping@biosap.com</p>
                <p><strong>Phone:</strong> +91-XXXXXXXXXX</p>
                <p><strong>Hours:</strong> Monday - Saturday, 9 AM - 6 PM</p>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>For faster assistance:</strong> Please have your order number ready when contacting support.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-gray-500 text-sm">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingDelivery;
