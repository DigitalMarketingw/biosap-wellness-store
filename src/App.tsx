
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { AdminProvider } from "./contexts/AdminContext";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import About from "./pages/About";
import Categories from "./pages/Categories";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductManagement from "./pages/admin/ProductManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import AdminUsers from "./pages/admin/AdminUsers";
import CategoryManagement from "./pages/admin/CategoryManagement";
import CustomerManagement from "./pages/admin/CustomerManagement";
import InventoryManagement from "./pages/admin/InventoryManagement";
import SupplierManagement from "./pages/admin/SupplierManagement";
import PromotionManagement from "./pages/admin/PromotionManagement";
import Analytics from "./pages/admin/Analytics";
import ActivityLogs from "./pages/admin/ActivityLogs";
import Settings from "./pages/admin/Settings";
import AdminNotFound from "./pages/admin/AdminNotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AdminProvider>
            <CartProvider>
              <WishlistProvider>
                <Routes>
                  {/* Auth Routes */}
                  <Route path="/auth/signin" element={<SignIn />} />
                  <Route path="/auth/signup" element={<SignUp />} />
                  
                  {/* Public Routes */}
                  <Route path="/" element={<Layout><Home /></Layout>} />
                  <Route path="/products" element={<Layout><Products /></Layout>} />
                  <Route path="/product/:id" element={<Layout><ProductDetails /></Layout>} />
                  <Route path="/about" element={<Layout><About /></Layout>} />
                  <Route path="/categories" element={<Layout><Categories /></Layout>} />
                  <Route path="/cart" element={<Layout><Cart /></Layout>} />
                  <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
                  <Route path="/checkout" element={
                    <ProtectedRoute>
                      <Layout><Checkout /></Layout>
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <ProtectedRoute requireAdmin>
                      <AdminLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<ProductManagement />} />
                    <Route path="categories" element={<CategoryManagement />} />
                    <Route path="orders" element={<OrderManagement />} />
                    <Route path="customers" element={<CustomerManagement />} />
                    <Route path="inventory" element={<InventoryManagement />} />
                    <Route path="suppliers" element={<SupplierManagement />} />
                    <Route path="promotions" element={<PromotionManagement />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="logs" element={<ActivityLogs />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="*" element={<AdminNotFound />} />
                  </Route>
                  
                  {/* Catch-all route for non-admin pages */}
                  <Route path="*" element={<Layout><NotFound /></Layout>} />
                </Routes>
              </WishlistProvider>
            </CartProvider>
          </AdminProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
