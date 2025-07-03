
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const CancellationRefund = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Hero Section */}
      <div className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cancellation & Refund Policy</h1>
          <p className="text-xl text-green-100">
            Clear guidelines for cancellations and refunds
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800 flex items-center gap-2">
                <CheckCircle className="h-6 w-6" />
                Order Cancellation Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-green-800 font-semibold">
                  ✅ FREE Cancellation Available Before Shipping
                </p>
              </div>
              <p className="text-gray-700">
                You can cancel your order free of charge before it has been shipped from our warehouse.
              </p>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">How to Cancel:</h4>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Log into your account and go to "My Orders"</li>
                  <li>Find the order you want to cancel</li>
                  <li>Click "Cancel Order" if the option is available</li>
                  <li>Alternatively, contact our customer support immediately</li>
                </ul>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <p className="text-amber-800">
                  <AlertCircle className="inline h-4 w-4 mr-2" />
                  <strong>Important:</strong> Once an order is shipped, it cannot be cancelled. 
                  Please check our return policy below for shipped orders.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800 flex items-center gap-2">
                <XCircle className="h-6 w-6" />
                Refund Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-800 font-semibold">
                  ❌ No Refunds for Change of Mind
                </p>
                <p className="text-red-700 mt-2">
                  We do not offer refunds for orders that have been delivered in good condition 
                  if you simply change your mind about the purchase.
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-green-800 font-semibold">
                  ✅ Refunds Available for Defective/Damaged Products Only
                </p>
              </div>
              
              <p className="text-gray-700">
                We will provide a full refund only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Product received is defective or damaged during shipping</li>
                <li>Wrong product was delivered</li>
                <li>Product is significantly different from description</li>
                <li>Product expires within 30 days of delivery</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">Return Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                If you received a defective or damaged product, follow these steps:
              </p>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-800">Step 1: Contact Us Within 48 Hours</h4>
                  <p className="text-gray-700">
                    Report the issue within 48 hours of delivery via email or phone with order details and photos of the damaged product.
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-800">Step 2: Return Authorization</h4>
                  <p className="text-gray-700">
                    Our team will review your case and provide a return authorization if eligible.
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-800">Step 3: Product Return</h4>
                  <p className="text-gray-700">
                    Package the product securely and ship it back using the provided return label (shipping costs covered by us for valid returns).
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-800">Step 4: Refund Processing</h4>
                  <p className="text-gray-700">
                    Once we receive and inspect the returned product, we'll process your refund within 7-10 business days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">Refund Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Order Cancellation</h4>
                  <p className="text-blue-700">3-5 business days</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800">Product Return</h4>
                  <p className="text-purple-700">7-10 business days after we receive the item</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm">
                * Refunds will be processed to the original payment method used for the purchase.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">Contact for Returns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                For all cancellation and refund requests, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> plantsmedg@gmail.com</p>
                <p><strong>Phone:</strong> +91-9799774222</p>
                <p><strong>Phone:</strong> +91-9351120119</p>
                <p><strong>Hours:</strong> Monday - Saturday, 9 AM - 6 PM</p>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Please have ready:</strong> Order number, product details, and photos of any defective/damaged items.
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

export default CancellationRefund;
