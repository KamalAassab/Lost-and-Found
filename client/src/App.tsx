import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import HomePage from "@/pages/HomePage";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CheckoutPage from "@/pages/CheckoutPage";
import SuccessPage from "@/pages/SuccessPage";
import LoginPage from "@/pages/admin/LoginPage";
import SignupPage from "@/pages/SignupPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import AdminProductsPage from "@/pages/admin/ProductsPage";
import AdminOrdersPage from "@/pages/admin/OrdersPage";
import AdminCategoriesPage from "@/pages/admin/CategoriesPage";
import MessagesPage from "@/pages/admin/MessagesPage";
import CartPage from "@/pages/CartPage";
import FAQPage from "@/pages/support/FAQPage";
import ShippingPage from "@/pages/support/ShippingPage";
import ReturnsPage from "@/pages/support/ReturnsPage";
import SizesPage from "@/pages/support/SizesPage";
import ContactPage from "@/pages/support/ContactPage";
import RecoverPage from "@/pages/RecoverPage";
import AccountDashboard from "@/pages/AccountDashboard";
import { Loader2 } from "lucide-react";
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";

function Router() {
  return (
    <Switch>
      {/* Customer facing routes */}
      <Route path="/" component={HomePage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/products/:category" component={ProductsPage} />
      <Route path="/product/:slug" component={ProductDetailPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/success" component={SuccessPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/cart" component={CartPage} />
      
      {/* Auth routes */}
      <Route path="/login" component={LoginPage} />
      <Route path="/admin" component={LoginPage} />
      <Route path="/account" component={AccountDashboard} />
      
      {/* Admin routes */}
      <Route path="/admin/dashboard" component={DashboardPage} />
      <Route path="/admin/products" component={AdminProductsPage} />
      <Route path="/admin/orders" component={AdminOrdersPage} />
      <Route path="/admin/categories" component={AdminCategoriesPage} />
      <Route path="/admin/messages" component={MessagesPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      
      {/* Support routes */}
      <Route path="/support/faq" component={FAQPage} />
      <Route path="/support/livraison" component={ShippingPage} />
      <Route path="/support/retours" component={ReturnsPage} />
      <Route path="/support/tailles" component={SizesPage} />
      <Route path="/support/contact" component={ContactPage} />
      
      {/* Recover route */}
      <Route path="/recover" component={RecoverPage} />
      
      {/* Legal pages */}
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppWithAuthLoading />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppWithAuthLoading() {
  const { isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <Loader2 className="h-12 w-12 animate-spin text-black" />
      </div>
    );
  }
  return (
    <CartProvider>
      <Router />
      <Toaster />
    </CartProvider>
  );
}

export default App;
