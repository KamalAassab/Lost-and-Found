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
        <div className="flex flex-col w-64 bg-primary text-white">
          <div className="flex items-center h-16 px-4 border-b border-gray-800">
            <ShopLogo className="h-8 w-auto" />
            <span className="ml-2 text-lg font-bold">ADMIN</span>
          </div>
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
            <nav className="flex-1 px-2 space-y-1">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-white hover:bg-gray-800 hover:text-white",
                  isDashboard && "bg-gray-800"
                )}
                onClick={() => setLocation("/admin/dashboard")}
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Tableau de bord
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-white hover:bg-gray-800 hover:text-white",
                  isProducts && "bg-gray-800"
                )}
                onClick={() => setLocation("/admin/products")}
              >
                <ShoppingBag className="mr-3 h-5 w-5" />
                Produits
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-white hover:bg-gray-800 hover:text-white",
                  isOrders && "bg-gray-800"
                )}
                onClick={() => setLocation("/admin/orders")}
              >
                <Package className="mr-3 h-5 w-5" />
                Commandes
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-white hover:bg-gray-800 hover:text-white",
                  isCategories && "bg-gray-800"
                )}
                onClick={() => setLocation("/admin/categories")}
              >
                <FileText className="mr-3 h-5 w-5" />
                Catégories
              </Button>
            </nav>
          </div>
          <div className="p-4 border-t border-gray-800">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-gray-800 hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
}
