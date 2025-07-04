
import React from 'react';
import { Link } from 'react-router-dom';

interface ProductBreadcrumbProps {
  product: {
    name: string;
    categories?: {
      name: string;
    };
  };
}

const ProductBreadcrumb: React.FC<ProductBreadcrumbProps> = ({ product }) => {
  return (
    <div className="flex items-center gap-2 text-sm text-green-600 mb-8">
      <Link to="/" className="hover:text-green-800">Home</Link>
      <span>/</span>
      <Link to="/products" className="hover:text-green-800">Products</Link>
      <span>/</span>
      {product.categories && (
        <>
          <span className="capitalize">{product.categories.name}</span>
          <span>/</span>
        </>
      )}
      <span className="text-green-800 font-medium">{product.name}</span>
    </div>
  );
};

export default ProductBreadcrumb;
