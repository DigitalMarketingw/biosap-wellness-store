
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Hero Section */}
      <div className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms & Conditions</h1>
          <p className="text-xl text-green-100">
            Please read these terms carefully before using our services
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                By accessing and using the BIOSAP website and services, you accept and agree to be bound 
                by the terms and provision of this agreement. If you do not agree to abide by the above, 
                please do not use this service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                When you create an account with us, you must provide information that is accurate, 
                complete, and current at all times.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You are responsible for safeguarding your account password</li>
                <li>You must not share your account with others</li>
                <li>You must notify us immediately of any unauthorized use</li>
                <li>We reserve the right to suspend or terminate accounts that violate our terms</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">Products and Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                All products and services are subject to availability. We reserve the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Modify or discontinue products without notice</li>
                <li>Update prices at any time</li>
                <li>Limit quantities available for purchase</li>
                <li>Refuse service to anyone for any reason</li>
              </ul>
              <p className="text-gray-700">
                All prices are displayed in Indian Rupees (INR) and include applicable taxes unless otherwise stated.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">Orders and Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                By placing an order, you represent that you are authorized to use the designated payment method.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>All orders are subject to acceptance by BIOSAP</li>
                <li>We may refuse or cancel orders at our discretion</li>
                <li>Payment must be received before order processing</li>
                <li>Order confirmation does not guarantee product availability</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We strive to provide accurate product information, but we do not warrant that product 
                descriptions or other content is accurate, complete, reliable, or error-free.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Product images are for illustration purposes only</li>
                <li>Actual products may vary slightly from images</li>
                <li>We reserve the right to correct any errors in product information</li>
                <li>Ayurvedic products are not intended to diagnose, treat, cure, or prevent any disease</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                BIOSAP shall not be liable for any indirect, incidental, special, consequential, or 
                punitive damages, including but not limited to loss of profits, data, or other intangible losses.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                These terms shall be governed by and construed in accordance with the laws of India. 
                Any disputes shall be subject to the exclusive jurisdiction of the courts in [Your City], India.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                For questions about these Terms and Conditions, please contact us at:
              </p>
              <div className="mt-4 text-gray-700">
                <p>Email: legal@biosap.com</p>
                <p>Phone: +91-XXXXXXXXXX</p>
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

export default TermsConditions;
