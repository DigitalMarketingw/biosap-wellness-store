
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Hero Section */}
      <div className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-green-100">
            Your privacy is important to us at BIOSAP
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We collect information you provide directly to us, such as when you create an account, 
                make a purchase, or contact us for support.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Personal information (name, email address, phone number)</li>
                <li>Shipping and billing addresses</li>
                <li>Payment information (processed securely through our payment partners)</li>
                <li>Order history and preferences</li>
                <li>Communication preferences</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We use the information we collect to provide, maintain, and improve our services:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders and account</li>
                <li>Provide customer support</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Improve our products and services</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">Information Sharing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We do not sell, trade, or otherwise transfer your personal information to third parties, 
                except in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>With your explicit consent</li>
                <li>To trusted third parties who assist us in operating our website and conducting business</li>
                <li>To comply with legal requirements or protect our rights</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. However, no method of 
                transmission over the internet is 100% secure.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Access and update your personal information</li>
                <li>Request deletion of your personal data</li>
                <li>Opt-out of marketing communications</li>
                <li>Request a copy of your data</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-800">Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-4 text-gray-700">
                <p>Email: privacy@biosap.com</p>
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

export default PrivacyPolicy;
