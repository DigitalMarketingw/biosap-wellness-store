
import React from 'react';
import ProductCard from '@/components/ProductCard';

interface RelatedProductsProps {
  products: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number;
    image_urls: string[] | null;
    rating: number | null;
    review_count: number | null;
    benefits: string[] | null;
    is_featured: boolean | null;
    stock?: number;
  }>;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ products }) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-green-800 mb-8">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
