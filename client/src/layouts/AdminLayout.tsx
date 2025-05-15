import React, { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, FileText, FileSliders, LayoutDashboard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShopLogo } from "@/components/ui/shop-logo";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [, setLocation] = useLocation();
  const { user, logout, isLoading } = useAuth();
  const [isDashboard] = useRoute("/admin/dashboard");
  const [isProducts] = useRoute("/admin/products");
  const [isOrders] = useRoute("/admin/orders");
  const [isCategories] = useRoute("/admin/categories");
  const [isMessages] = useRoute("/admin/messages");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/admin");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/admin");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 min-h-screen bg-black text-white rounded-r-2xl shadow-xl transition-all duration-300">
          <div className="flex items-center justify-center h-24 px-4">
            <a href="/" aria-label="Accueil" className="focus:outline-none focus:ring-2 focus:ring-white rounded transition hover:opacity-80">
              <ShopLogo className="h-14 w-auto" />
            </a>
          </div>
          <div className="flex flex-col flex-grow pt-8 overflow-y-auto">
            <nav className="flex-1 px-4 space-y-2">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-white font-semibold text-lg rounded-xl py-3 px-3 mb-1 transition-all duration-200 hover:bg-gray-800 hover:text-white border border-transparent",
                  isDashboard && "bg-white/10 border border-white text-white font-bold shadow-md"
                )}
                onClick={() => setLocation("/admin/dashboard")}
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Tableau de bord
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-white font-semibold text-lg rounded-xl py-3 px-3 mb-1 transition-all duration-200 hover:bg-gray-800 hover:text-white border border-transparent",
                  isProducts && "bg-white/10 border border-white text-white font-bold shadow-md"
                )}
                onClick={() => setLocation("/admin/products")}
              >
                <ShoppingBag className="mr-3 h-5 w-5" />
                Produits
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-white font-semibold text-lg rounded-xl py-3 px-3 mb-1 transition-all duration-200 hover:bg-gray-800 hover:text-white border border-transparent",
                  isOrders && "bg-white/10 border border-white text-white font-bold shadow-md"
                )}
                onClick={() => setLocation("/admin/orders")}
              >
                <Package className="mr-3 h-5 w-5" />
                Commandes
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-white font-semibold text-lg rounded-xl py-3 px-3 mb-1 transition-all duration-200 hover:bg-gray-800 hover:text-white border border-transparent",
                  isCategories && "bg-white/10 border border-white text-white font-bold shadow-md"
                )}
                onClick={() => setLocation("/admin/categories")}
              >
                <FileText className="mr-3 h-5 w-5" />
                Catégories
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-white font-semibold text-lg rounded-xl py-3 px-3 mb-1 transition-all duration-200 hover:bg-gray-800 hover:text-white border border-transparent",
                  isMessages && "bg-white/10 border border-white text-white font-bold shadow-md"
                )}
                onClick={() => setLocation("/admin/messages")}
              >
                <FileSliders className="mr-3 h-5 w-5" />
                Messages
              </Button>
            </nav>
          </div>
          <div className="p-6 border-t border-gray-800 mt-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-white font-semibold text-lg rounded-xl py-3 px-3 transition-all duration-200 hover:bg-gray-800 hover:text-white border border-gray-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span className="font-bold">Déconnexion</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top right ADMIN label */}
        {/* Removed empty div that previously contained 'Admin Dashboard' text */}

        {/* Top navigation for mobile */}
        <div className="md:hidden bg-primary text-white p-4 flex items-center justify-between">
          <ShopLogo className="h-8 w-auto" />
          <Button 
            variant="ghost" 
            className="p-2"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden flex justify-between overflow-x-auto bg-gray-800 text-white p-2">
          <Button
            variant="ghost"
            className={cn(
              "flex-1 py-2 px-1 text-xs text-white hover:bg-gray-700",
              isDashboard && "bg-gray-700"
            )}
            onClick={() => setLocation("/admin/dashboard")}
          >
            <div className="flex flex-col items-center">
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </div>
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "flex-1 py-2 px-1 text-xs text-white hover:bg-gray-700",
              isProducts && "bg-gray-700"
            )}
            onClick={() => setLocation("/admin/products")}
          >
            <div className="flex flex-col items-center">
              <ShoppingBag className="h-5 w-5" />
              <span>Produits</span>
            </div>
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "flex-1 py-2 px-1 text-xs text-white hover:bg-gray-700",
              isOrders && "bg-gray-700"
            )}
            onClick={() => setLocation("/admin/orders")}
          >
            <div className="flex flex-col items-center">
              <Package className="h-5 w-5" />
              <span>Commandes</span>
            </div>
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "flex-1 py-2 px-1 text-xs text-white hover:bg-gray-700",
              isCategories && "bg-gray-700"
            )}
            onClick={() => setLocation("/admin/categories")}
          >
            <div className="flex flex-col items-center">
              <FileText className="h-5 w-5" />
              <span>Catégories</span>
            </div>
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "flex-1 py-2 px-1 text-xs text-white hover:bg-gray-700",
              isMessages && "bg-gray-700"
            )}
            onClick={() => setLocation("/admin/messages")}
          >
            <div className="flex flex-col items-center">
              <FileSliders className="h-5 w-5" />
              <span>Messages</span>
            </div>
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
}
