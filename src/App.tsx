
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { AdminProvider } from "./contexts/AdminContext";
import Layout from "./components/Layout";
import AdminLayout from "./components/admin/AdminLayout";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductManagement from "./pages/admin/ProductManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import AdminNotFound from "./pages/admin/AdminNotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AdminProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Layout><Home /></Layout>} />
                <Route path="/products" element={<Layout><Products /></Layout>} />
                <Route path="/cart" element={<Layout><Cart /></Layout>} />
                <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
                <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<ProductManagement />} />
                  <Route path="orders" element={<OrderManagement />} />
                  <Route path="*" element={<AdminNotFound />} />
                </Route>
                
                {/* Catch-all route for non-admin pages */}
                <Route path="*" element={<Layout><NotFound /></Layout>} />
              </Routes>
            </WishlistProvider>
          </CartProvider>
        </AdminProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
