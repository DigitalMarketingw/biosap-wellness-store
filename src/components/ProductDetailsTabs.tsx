
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ProductDetailsTabsProps {
  product: {
    ingredients?: string;
    usage_instructions?: string;
  };
}

const ProductDetailsTabs: React.FC<ProductDetailsTabsProps> = ({ product }) => {
  return (
    <Card className="border-green-200 mb-16">
      <CardContent className="p-8">
        <div className="space-y-8">
          {/* Ingredients */}
          {product.ingredients && (
            <div>
              <h3 className="text-xl font-semibold text-green-800 mb-4">Ingredients</h3>
              <p className="text-gray-600 leading-relaxed">{product.ingredients}</p>
            </div>
          )}

          {/* Usage Instructions */}
          {product.usage_instructions && (
            <>
              <Separator className="my-6" />
              <div>
                <h3 className="text-xl font-semibold text-green-800 mb-4">Usage Instructions</h3>
                <p className="text-gray-600 leading-relaxed">{product.usage_instructions}</p>
              </div>
            </>
          )}

          {/* Return Policy */}
          <Separator className="my-6" />
          <div>
            <h3 className="text-xl font-semibold text-green-800 mb-4">Return & Refund Policy</h3>
            <div className="space-y-3 text-gray-600">
              <p>• 30-day return policy for unopened products</p>
              <p>• Full refund or exchange available</p>
              <p>• Product must be in original packaging</p>
              <p>• Return shipping costs may apply</p>
              <p>• Perishable items cannot be returned</p>
            </div>
          </div>

          {/* Shipping Information */}
          <Separator className="my-6" />
          <div>
            <h3 className="text-xl font-semibold text-green-800 mb-4">Shipping Information</h3>
            <div className="space-y-3 text-gray-600">
              <p>• Free shipping on orders over ₹999</p>
              <p>• Standard delivery: 3-5 business days</p>
              <p>• Express delivery: 1-2 business days (additional charges apply)</p>
              <p>• All products are carefully packaged to ensure freshness</p>
              <p>• Tracking information provided for all orders</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductDetailsTabs;
