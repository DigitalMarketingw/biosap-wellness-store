
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, X, ShoppingCart, Heart, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from '@/components/auth/UserMenu';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { items } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user } = useAuth();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Categories', href: '/categories' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
  const wishlistItemCount = wishlistItems.length;

  const isCurrentPath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-green-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/319c00b0-f81f-4cc6-b556-2a25b4c8c865.png" 
              alt="BIOSAP" 
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`font-medium transition-colors hover:text-green-600 ${
                  isCurrentPath(item.href) 
                    ? 'text-green-600 border-b-2 border-green-600 pb-1' 
                    : 'text-gray-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Wishlist */}
            <Link to="/wishlist" className="relative">
              <Button variant="ghost" size="sm" className="p-2">
                <Heart className="h-5 w-5" />
                {wishlistItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                    {wishlistItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="sm" className="p-2">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-green-600">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Authentication */}
            {user ? (
              <UserMenu />
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/signup">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-green-100">
            <div className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`font-medium transition-colors hover:text-green-600 py-2 ${
                    isCurrentPath(item.href) 
                      ? 'text-green-600 border-l-4 border-green-600 pl-3' 
                      : 'text-gray-700'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                {/* Mobile Wishlist */}
                <Link to="/wishlist" className="relative" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Heart className="h-5 w-5" />
                    {wishlistItemCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                        {wishlistItemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* Mobile Cart */}
                <Link to="/cart" className="relative" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" size="sm" className="p-2">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-green-600">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* Mobile User Authentication */}
                {user ? (
                  <Link to="/profile" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" size="sm" className="p-2">
                      <User className="h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <div className="flex flex-col space-y-2 flex-1">
                    <Link to="/auth/signin" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth/signup" onClick={() => setIsOpen(false)}>
                      <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
