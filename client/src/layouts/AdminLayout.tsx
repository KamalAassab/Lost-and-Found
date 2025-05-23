import React, { useEffect } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, FileText, FileSliders, LayoutDashboard, LogOut, Users } from "lucide-react";
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
  const [isUsers] = useRoute("/admin/users");

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

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Produits", href: "/admin/products", icon: ShoppingBag },
    { name: "Catégories", href: "/admin/categories", icon: FileText },
    { name: "Commandes", href: "/admin/orders", icon: Package },
    { name: "Messages", href: "/admin/messages", icon: FileSliders },
    { name: "Utilisateurs", href: "/admin/users", icon: Users },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-black text-white shadow-lg transition-all duration-300">
          <div className="flex items-center justify-center h-24 px-4">
            <a href="/" aria-label="Accueil" className="focus:outline-none focus:ring-2 focus:ring-white rounded transition hover:opacity-80">
              <ShopLogo className="h-14 w-auto" />
            </a>
          </div>
          <div className="flex flex-col flex-grow pt-8 overflow-y-auto">
            <nav className="flex-1 px-4 space-y-2">
              {navItems.map((item) => {
                 const [isActive] = useRoute(item.href);
                 return (
                  <Link 
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "w-full flex items-center p-3 rounded-md transition-colors duration-200 group",
                      isActive ? "bg-neutral-800 text-white" : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("mr-4 h-5 w-5 transition-colors duration-200", isActive ? "text-white" : "text-neutral-500 group-hover:text-white")} />
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                 );
              })}
            </nav>
          </div>
          <div className="p-4 border-t border-gray-800 mt-auto">
            <Button
              variant="ghost"
              className="w-full justify-start text-white font-semibold text-lg rounded-xl py-3 px-3 transition-all duration-200 hover:bg-gray-800 hover:text-white border border-gray-600"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span className="font-bold text-base">Déconnexion</span>
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
          {navItems.map((item) => {
            const [isActive] = useRoute(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex-1 py-3 px-1 text-xs text-white hover:bg-gray-700",
                  isActive ? "bg-gray-700" : ""
                )}
              >
                <div className="flex flex-col items-center">
                  <item.icon className="h-5 w-5 mb-1" />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
}
