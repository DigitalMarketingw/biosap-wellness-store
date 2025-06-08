import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Heart, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from '@/components/auth/UserMenu';

const Navbar = () => {
  const { getTotalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user, loading } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-green-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/ab5ccc34-8661-4343-abac-8863eb7e8c1c.png" 
              alt="BIOSAP Logo" 
              className="h-8 w-auto"
            />
            <Badge variant="secondary" className="bg-green-100 text-green-700">Ayurvedic</Badge>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-6">
              <Link to="/" className="text-green-700 hover:text-green-900 font-medium">Home</Link>
              <Link to="/products" className="text-green-700 hover:text-green-900 font-medium">Products</Link>
              <a href="#" className="text-green-700 hover:text-green-900 font-medium">Categories</a>
              <a href="#" className="text-green-700 hover:text-green-900 font-medium">Wellness</a>
              <a href="#" className="text-green-700 hover:text-green-900 font-medium">About</a>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 h-4 w-4" />
              <Input 
                placeholder="Search natural products..." 
                className="pl-10 w-64 border-green-200 focus:border-green-400"
              />
            </div>
            
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-800 relative">
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-green-600 text-white text-xs"
                  >
                    {wishlistItems.length}
                  </Badge>
                )}
              </Button>
            </Link>
            
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-800 relative">
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-green-600 text-white text-xs"
                  >
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </Link>
            
            {!loading && (
              <>
                {user ? (
                  <UserMenu />
                ) : (
                  <div className="flex space-x-2">
                    <Link to="/auth/signin">
                      <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth/signup">
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        Register
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
