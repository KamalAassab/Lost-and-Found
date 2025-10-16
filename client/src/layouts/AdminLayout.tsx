import React, { useEffect } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ProfessionalLoader } from "@/components/ui/professional-loader";
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
      <ProfessionalLoader 
        title="LOST & FOUND"
        subtitle="Administration"
        loadingSteps={[
          "Vérification des permissions",
          "Chargement du tableau de bord",
          "Préparation de l'interface admin"
        ]}
      />
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
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Enhanced Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-72 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white shadow-2xl transition-all duration-300 border-r border-gray-700">
          {/* Logo Section */}
          <div className="flex items-center justify-center h-28 px-6 border-b border-gray-700">
            <a href="/" aria-label="Accueil" className="group focus:outline-none focus:ring-2 focus:ring-white rounded-xl transition-all duration-300">
              <ShopLogo className="h-12 w-auto text-white" />
            </a>
          </div>
          
          {/* Navigation */}
          <div className="flex flex-col flex-grow pt-6 overflow-y-auto">
            <nav className="flex-1 px-4 space-y-3">
              {navItems.map((item) => {
                 const [isActive] = useRoute(item.href);
                 return (
                  <Link 
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group relative w-full flex items-center p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl",
                      isActive 
                        ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25" 
                        : "text-gray-300 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 hover:text-white"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg transition-all duration-300",
                      isActive 
                        ? "bg-red-500/20 shadow-lg" 
                        : "bg-gray-700/50 group-hover:bg-white/20"
                    )}>
                      <item.icon className={cn(
                        "h-5 w-5 transition-all duration-300", 
                        isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                      )} />
                    </div>
                    <span className="ml-4 font-semibold text-base">{item.name}</span>
                    {isActive && (
                      <div className="absolute right-4 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </Link>
                 );
              })}
            </nav>
          </div>
          
          {/* Logout Section */}
          <div className="p-6 border-t border-gray-700">
            <Button
              variant="ghost"
              className="w-full justify-start text-white font-semibold text-lg rounded-xl py-4 px-4 transition-all duration-300 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 hover:text-white hover:scale-105 hover:shadow-xl border border-gray-600 hover:border-red-500"
              onClick={handleLogout}
            >
              <div className="p-2 bg-red-500/20 rounded-lg mr-3 transition-all duration-300 group-hover:bg-red-500/30">
                <LogOut className="h-5 w-5" />
              </div>
              <span className="font-bold text-base">Déconnexion</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Enhanced Mobile Header */}
        <div className="md:hidden bg-gradient-to-r from-gray-900 to-black text-white p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <ShopLogo className="h-8 w-auto text-white" />
            <span className="font-bold text-lg">Administration</span>
          </div>
          <Button 
            variant="ghost" 
            className="p-2 hover:bg-red-500/20 text-white hover:text-white transition-all duration-300"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        {/* Enhanced Mobile Navigation */}
        <div className="md:hidden flex justify-between overflow-x-auto bg-gradient-to-r from-gray-800 to-gray-900 text-white p-3 shadow-lg">
          {navItems.map((item) => {
            const [isActive] = useRoute(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex-1 py-4 px-2 text-xs text-white hover:bg-gray-700/50 rounded-lg transition-all duration-300 hover:scale-105",
                  isActive ? "bg-gradient-to-r from-red-600 to-red-700 shadow-lg" : ""
                )}
              >
                <div className="flex flex-col items-center space-y-1">
                  <div className={cn(
                    "p-2 rounded-lg transition-all duration-300",
                    isActive ? "bg-red-500/20" : "bg-gray-700/50"
                  )}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Enhanced Content Area */}
        <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-50 via-white to-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
}
