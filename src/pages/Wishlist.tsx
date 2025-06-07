
import React from 'react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = async (productId: string) => {
    await addToCart(productId);
    await removeFromWishlist(productId);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <Heart className="h-24 w-24 text-green-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-green-800 mb-4">Your wishlist is empty</h2>
          <p className="text-green-600 mb-8">
            Save your favorite Ayurvedic products for later by adding them to your wishlist.
          </p>
          <Link to="/products">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-green-800">My Wishlist</h1>
        <p className="text-green-600">{items.length} item{items.length !== 1 ? 's' : ''}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <Card key={item.id} className="border-green-100 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="relative mb-4">
                <img
                  src={item.product.image_urls?.[0] || '/placeholder.svg'}
                  alt={item.product.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromWishlist(item.product_id)}
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 hover:text-red-700"
                >
                  <Heart className="h-4 w-4 fill-current" />
                </Button>
              </div>
              
              <h3 className="font-semibold text-green-800 mb-2 line-clamp-2">
                {item.product.name}
              </h3>
              
              {item.product.description && (
                <p className="text-sm text-green-600 mb-3 line-clamp-2">
                  {item.product.description}
                </p>
              )}
              
              <div className="flex items-center gap-2 mb-3">
                {item.product.rating && (
                  <>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-green-700 ml-1">
                        {item.product.rating}
                      </span>
                    </div>
                    {item.product.review_count && (
                      <span className="text-sm text-green-500">
                        ({item.product.review_count} reviews)
                      </span>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-green-800">
                  ₹{item.product.price}
                </span>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={() => handleMoveToCart(item.product_id)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Move to Cart
                </Button>
                <Button
                  variant="outline"
                  onClick={() => removeFromWishlist(item.product_id)}
                  className="w-full border-green-300 text-green-700 hover:bg-green-50"
                >
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
