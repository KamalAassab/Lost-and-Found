import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, User, Heart, ShoppingBag, LogOut, Image as ImageIcon, 
  Pencil, Trash2, Check, X, ShoppingCart, MapPin, Phone, Mail, 
  Home, Eye, EyeOff, Package, Lock, Star, Award, TrendingUp, 
  Calendar, CreditCard, Truck, Shield, Sparkles, ArrowRight, 
  Gift, Bell, Edit3, Save, RotateCcw, Menu, UserCircle,
  FileText, History, Star as StarIcon, ChevronRight, Plus,
  Zap, Target, Crown, Clock, DollarSign, Users, BarChart3,
  ShoppingCart as CartIcon, Star as StarIcon2, TrendingDown,
  Activity, Globe, Shield as ShieldIcon, Gift as GiftIcon
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation, Link } from "wouter";
import { ShopLogo } from "@/components/ui/shop-logo";
import { useQuery } from "@tanstack/react-query";
import { ProfessionalLoader } from "@/components/ui/professional-loader";

interface OrderItem {
  id: number;
  productId: number;
  size: string;
  quantity: number;
  price: number;
  isFree?: boolean;
  product?: {
    name: string;
    image?: string;
    slug?: string;
  };
}

interface Order {
  id: number;
  status: string;
  total: number;
  free_shipping?: boolean;
  promoApplied?: boolean;
  paymentMethod?: string;
  createdAt: string;
  items: OrderItem[];
}

interface WishlistItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    image?: string;
    slug?: string;
  };
}

const MOROCCO_CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", 
  "Meknès", "Oujda", "Kénitra", "Tétouan", "Safi", "Mohammedia"
];

const menuItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3, active: true },
  { id: 'profile', label: 'Mon Profil', icon: UserCircle },
  { id: 'orders', label: 'Mes Commandes', icon: ShoppingBag, count: 0 },
  { id: 'wishlist', label: 'Favoris', icon: Heart, count: 0 },
];

export default function AccountDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch products for "You can also buy" section
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/products');
      return response || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const [userInfo, setUserInfo] = useState({
    username: user?.username || "",
    fullname: (user as any)?.fullname || "",
    email: (user as any)?.email || "",
    phone: (user as any)?.phone || "",
    address: (user as any)?.address || "",
    city: (user as any)?.city || "",
    postalCode: (user as any)?.postalCode || ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Update userInfo when user data changes
  useEffect(() => {
    if (user) {
      setUserInfo({
        username: user.username || "",
        fullname: (user as any)?.fullname || "",
        email: (user as any)?.email || "",
        phone: (user as any)?.phone || "",
        address: (user as any)?.address || "",
        city: (user as any)?.city || "",
        postalCode: (user as any)?.postalCode || ""
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [ordersRes, wishlistRes] = await Promise.all([
          apiRequest("GET", "/api/my-orders"),
          apiRequest("GET", "/api/wishlist")
        ]);
        
        setOrders(ordersRes || []);
        setWishlist(wishlistRes || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos données",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, toast]);

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleUpdateInfo = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setPasswordError("");
    
    try {
      // Update profile information
      const updateData = {
        username: userInfo.username,
        fullname: userInfo.fullname,
        phone: userInfo.phone,
        address: userInfo.address,
        city: userInfo.city,
        postalCode: userInfo.postalCode
      };

      await apiRequest("PUT", "/api/me", updateData);

      // Update password if provided
      if (passwordData.currentPassword && passwordData.newPassword) {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          setPasswordError("Les mots de passe ne correspondent pas");
          setIsSaving(false);
          return;
        }

        await apiRequest("PUT", "/api/me-password", {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        });
      }

      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès"
      });

      setIsEditing(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      console.error("Update error:", error);
      setPasswordError(error.message || "Erreur lors de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveFromWishlist = async (itemId: number) => {
    try {
      await apiRequest("DELETE", `/api/wishlist/${itemId}`);
      setWishlist(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: "Supprimé",
        description: "Produit retiré de votre liste de souhaits"
      });
    } catch (error) {
      console.error("Remove from wishlist error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de retirer le produit",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        label: "En attente", 
        className: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-bold text-xs px-3 py-1 rounded-full"
      },
      processing: { 
        label: "En traitement", 
        className: "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-bold text-xs px-3 py-1 rounded-full"
      },
      shipped: { 
        label: "Expédiée", 
        className: "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-bold text-xs px-3 py-1 rounded-full"
      },
      delivered: { 
        label: "Livrée", 
        className: "bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-bold text-xs px-3 py-1 rounded-full"
      },
      cancelled: { 
        label: "Annulée", 
        className: "bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-bold text-xs px-3 py-1 rounded-full"
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge 
        variant="secondary" 
        className={config.className}
      >
        {config.label}
      </Badge>
    );
  };

  // Helper function to format currency
  const formatCurrency = (amount: number | string) => {
    return parseFloat(amount.toString()).toFixed(2);
  };

  // Dashboard statistics
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;
  const completedOrders = orders.filter(order => order.status === 'delivered').length;

  if (isLoading) {
    return (
      <ProfessionalLoader 
        title="LOST & FOUND"
        subtitle="Espace Client"
        loadingSteps={[
          "Vérification de l'authentification",
          "Chargement des commandes",
          "Préparation de l'interface"
        ]}
      />
    );
  }

  if (!user) return null;

  const updatedMenuItems = menuItems.map(item => ({
    ...item,
    count: item.id === 'orders' ? orders.length : item.id === 'wishlist' ? wishlist.length : undefined
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
        <Link href="/">
                <div className="flex items-center space-x-3 cursor-pointer group">
                  <ShopLogo className="h-8 w-auto text-white group-hover:scale-105 transition-transform duration-200" />
                </div>
        </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden text-white hover:bg-gray-800">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-6 border-b">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-black text-white">
                            {(userInfo.fullname || userInfo.username || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{userInfo.fullname || userInfo.username}</p>
                          <p className="text-sm text-gray-500">@{userInfo.username}</p>
                        </div>
                      </div>
                    </div>
                    
                    <nav className="flex-1 p-6">
                      <div className="space-y-2">
                        {updatedMenuItems.map((item) => (
                          <Button
                            key={item.id}
                            variant={activeTab === item.id ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <item.icon className="h-4 w-4 mr-3" />
                            {item.label}
                            {item.count !== undefined && (
                              <Badge 
                                variant="secondary" 
                                className="ml-auto bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 font-bold text-xs px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center"
                              >
                                {item.count}
                              </Badge>
                            )}
                          </Button>
                        ))}
                      </div>
                    </nav>
                    
                    <div className="p-6 border-t">
          <Button
            onClick={handleLogout}
                        variant="outline"
                        className="w-full"
          >
                        <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              {/* Desktop Logout */}
          <Button
            onClick={handleLogout}
                variant="outline"
                className="hidden lg:flex bg-white hover:bg-gray-50 text-black border-gray-300 hover:scale-105 transition-all duration-200"
          >
                <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-black text-white">
                      {(userInfo.fullname || userInfo.username || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{userInfo.fullname || userInfo.username}</h3>
                    <p className="text-sm text-gray-500">@{userInfo.username}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {updatedMenuItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? "default" : "ghost"}
                      className="w-full justify-start rounded-none h-12"
                      onClick={() => setActiveTab(item.id)}
                    >
                      <item.icon className="h-4 w-4 mr-3" />
                      {item.label}
                      {item.count !== undefined && (
                        <Badge 
                          variant="secondary" 
                          className="ml-auto bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 font-bold text-xs px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center"
                        >
                          {item.count}
                        </Badge>
                      )}
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-6">
                {/* Welcome Section */}
                <Card className="bg-gradient-to-r from-black to-gray-800 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-bold mb-2">
                          Bienvenue, {userInfo.fullname || userInfo.username}!
                        </h1>
                        <p className="text-gray-200">
                          Gérez vos commandes, favoris et profitez de nos offres exclusives.
                        </p>
                      </div>
                      <div className="hidden md:flex space-x-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{orders.length}</div>
                          <div className="text-sm text-gray-300">Commandes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{wishlist.length}</div>
                          <div className="text-sm text-gray-300">Favoris</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{products.length}</div>
                          <div className="text-sm text-gray-300">Produits</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total dépensé</p>
                          <p className="text-lg font-semibold">{formatCurrency(totalSpent)} MAD</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <ShoppingCart className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Commandes</p>
                          <p className="text-lg font-semibold">{orders.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Panier moyen</p>
                          <p className="text-lg font-semibold">{formatCurrency(averageOrderValue)} MAD</p>
              </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Heart className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Favoris</p>
                          <p className="text-lg font-semibold">{wishlist.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-5 w-5" />
                      <span>Actions rapides</span>
                    </CardTitle>
                    <CardDescription>Accédez rapidement aux fonctionnalités principales</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Link href="/products">
                        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 group">
                          <CardContent className="p-4 text-center">
                            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                              <ShoppingBag className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-semibold mb-1">Nouveaux produits</h3>
                            <p className="text-sm text-gray-500">Découvrez notre dernière collection</p>
                          </CardContent>
                        </Card>
                      </Link>

                      <Link href="/products?category=hoodies">
                        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 group">
                          <CardContent className="p-4 text-center">
                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                              <Heart className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-semibold mb-1">Hoodies</h3>
                            <p className="text-sm text-gray-500">Explorez nos hoodies tendance</p>
                          </CardContent>
                        </Card>
                      </Link>

                      <Link href="/products?category=tshirts">
                        <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 group">
                          <CardContent className="p-4 text-center">
                            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                              <StarIcon2 className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="font-semibold mb-1">T-shirts</h3>
                            <p className="text-sm text-gray-500">T-shirts de qualité premium</p>
                          </CardContent>
                        </Card>
                      </Link>
              </div>
                  </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Commandes récentes</span>
                    </CardTitle>
                    <CardDescription>Vos dernières commandes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Aucune commande</h3>
                        <p className="text-gray-500 mb-4">Commencez votre shopping dès maintenant !</p>
                        <Link href="/products">
                          <Button className="bg-black hover:bg-gray-800">
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Découvrir nos produits
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders.slice(0, 3).map((order, idx) => (
                          <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                                <span className="text-white font-bold">#{orders.length - idx}</span>
                              </div>
                              <div>
                                <p className="font-medium">Commande #{orders.length - idx}</p>
                                <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(order.total)} MAD</p>
                              {getStatusBadge(order.status)}
                            </div>
                          </div>
                        ))}
                        {orders.length > 3 && (
                          <div className="text-center pt-2">
                            <Button variant="outline" onClick={() => setActiveTab('orders')}>
                              Voir toutes les commandes
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* You can also buy */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ShoppingBag className="h-5 w-5" />
                      <span>Vous pourriez aussi aimer</span>
                    </CardTitle>
                    <CardDescription>Découvrez nos produits recommandés</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {products.slice(0, 4).map((product: any) => (
                            <div key={product.id} className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-105">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                    {product.imageUrl ? (
                                      <img 
                                        src={product.imageUrl} 
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="h-6 w-6 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm text-gray-900 truncate group-hover:text-black transition-colors">
                                    {product.name}
                                  </h4>
                                  <p className="text-xs text-gray-500 mb-2">
                                    {typeof product.category === 'object' ? product.category.name : product.category}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-lg font-bold text-black">
                                        {formatCurrency(product.price)} MAD
                                      </span>
                                      {product.oldPrice && product.oldPrice > product.price && (
                                        <span className="text-sm text-gray-400 line-through">
                                          {formatCurrency(product.oldPrice)} MAD
                  </span>
                )}
              </div>
                                    <Link href={`/product/${product.slug || product.id}`}>
                                      <Button size="sm" variant="outline" className="text-xs">
                                        Voir
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">Aucun produit disponible</p>
                        </div>
                      )}
                      
                      {products.length > 4 && (
                        <div className="text-center pt-2">
                          <Link href="/products">
                            <Button variant="outline" className="w-full">
                              Voir tous les produits
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <UserCircle className="h-5 w-5" />
                          <span>Informations personnelles</span>
                        </CardTitle>
                        <CardDescription>Toutes vos informations de profil</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
                        {isEditing ? "Annuler" : "Modifier"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
            {isEditing ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="username">Nom d'utilisateur</Label>
                            <Input
                              id="username"
                              value={userInfo.username}
                              onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })}
                            />
                      </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="fullname">Nom complet</Label>
                            <Input
                              id="fullname"
                              value={userInfo.fullname}
                              onChange={(e) => setUserInfo({ ...userInfo, fullname: e.target.value })}
                            />
                      </div>
                      </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            value={userInfo.email}
                            disabled
                            className="bg-gray-50"
                          />
                      </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Téléphone</Label>
                            <Input
                              id="phone"
                              value={userInfo.phone}
                              onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                            />
                      </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="postalCode">Code postal</Label>
                            <Input
                              id="postalCode"
                              value={userInfo.postalCode}
                              onChange={(e) => setUserInfo({ ...userInfo, postalCode: e.target.value })}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="address">Adresse</Label>
                          <Input
                            id="address"
                            value={userInfo.address}
                            onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="city">Ville</Label>
                        <select
                            id="city"
                            value={userInfo.city}
                            onChange={(e) => setUserInfo({ ...userInfo, city: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                          >
                            <option value="">Sélectionner</option>
                          {MOROCCO_CITIES.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>

                        <Separator />

                        <div className="space-y-4">
                          <h4 className="font-medium flex items-center space-x-2">
                            <Lock className="h-4 w-4" />
                            <span>Changer le mot de passe</span>
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                              <div className="relative">
                                <Input
                                  id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                                  value={passwordData.currentPassword}
                                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                />
                                <Button
                          type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                </div>
                </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                              <div className="relative">
                                <Input
                                  id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                                  value={passwordData.newPassword}
                                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                />
                                <Button
                          type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            />
                </div>
                          
                      {passwordError && (
                            <p className="text-sm text-red-600">{passwordError}</p>
                      )}
                </div>

                        <div className="flex space-x-3">
                          <Button
                            onClick={handleUpdateInfo}
                            disabled={isSaving}
                            className="flex-1"
                          >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Enregistrer
                      </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false);
                              setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                              setPasswordError("");
                            }}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Annuler
                  </Button>
                </div>
              </div>
            ) : (
                      <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-16 w-16">
                            <AvatarFallback className="bg-black text-white text-lg">
                              {(userInfo.fullname || userInfo.username || 'U').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-xl font-semibold">{userInfo.fullname || userInfo.username}</h3>
                            <p className="text-gray-500">@{userInfo.username}</p>
                    </div>
                    </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <Mail className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">{userInfo.email}</p>
                    </div>
                    </div>
                            
                            {userInfo.phone && (
                              <div className="flex items-center space-x-3">
                                <Phone className="h-5 w-5 text-gray-400" />
                                <div>
                                  <p className="text-sm text-gray-500">Téléphone</p>
                                  <p className="font-medium">{userInfo.phone}</p>
                    </div>
                    </div>
                )}
                    </div>
                          
                          <div className="space-y-4">
                            {userInfo.address && (
                              <div className="flex items-center space-x-3">
                                <MapPin className="h-5 w-5 text-gray-400" />
                                <div>
                                  <p className="text-sm text-gray-500">Adresse</p>
                                  <p className="font-medium">{userInfo.address}</p>
                </div>
                  </div>
                )}
                            
                            {(userInfo.city || userInfo.postalCode) && (
                              <div className="flex items-center space-x-3">
                                <Home className="h-5 w-5 text-gray-400" />
                                <div>
                                  <p className="text-sm text-gray-500">Ville</p>
                                  <p className="font-medium">
                                    {userInfo.city} {userInfo.postalCode && `(${userInfo.postalCode})`}
                                  </p>
              </div>
                              </div>
                            )}
                          </div>
                        </div>
                                    </div>
                                  )}
          </CardContent>
        </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ShoppingBag className="h-5 w-5" />
                      <span>Mes Commandes</span>
                      <Badge variant="outline">{orders.length}</Badge>
                    </CardTitle>
                    <CardDescription>Suivez vos commandes et leur statut</CardDescription>
                  </CardHeader>
                  <CardContent>
            {orders.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <ShoppingCart className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Aucune commande</h3>
                        <p className="text-gray-500 mb-6">Commencez votre shopping dès maintenant !</p>
                        <Link href="/products">
                          <Button className="bg-black hover:bg-gray-800">
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Découvrir nos produits
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                    {orders
                      .slice()
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((order, idx) => (
                            <Card key={order.id} className="border-l-4 border-l-black">
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <h4 className="font-semibold text-lg">Commande #{orders.length - idx}</h4>
                                    <p className="text-sm text-gray-500 flex items-center space-x-1">
                                      <Calendar className="h-4 w-4" />
                                      <span>{formatDate(order.createdAt)}</span>
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xl font-bold">{formatCurrency(order.total)} MAD</p>
                                {getStatusBadge(order.status)}
                              </div>
                            </div>
                                
                          {order.items && order.items.length > 0 && (
                                  <div className="space-y-3">
                                    <h5 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                                      <Package className="h-4 w-4" />
                                      <span>Articles ({order.items.length})</span>
                                    </h5>
                                    <div className="space-y-2">
                              {order.items.map((item) => (
                                        <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                  {item.product?.image ? (
                                              <img 
                                                src={(item.product as any)?.imageUrl || `/${(item.product as any)?.image}`} 
                                                alt={item.product.name} 
                                                className="w-full h-full object-cover rounded" 
                                              />
                                            ) : (
                                              <ImageIcon className="h-6 w-6 text-gray-400" />
                                            )}
                                          </div>
                                  <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{item.product?.name || 'Produit inconnu'}</p>
                                            <p className="text-sm text-gray-500">
                                              Taille: {item.size} • Qté: {item.quantity}
                                            </p>
                                  </div>
                                          <div className="text-right">
                                            <p className="font-semibold">{formatCurrency(item.price * item.quantity)} MAD</p>
                                    {item.product && (
                                              <Link href={item.product.slug ? `/product/${item.product.slug}` : `/product/${item.productId}`}>
                                                <Button variant="outline" size="sm" className="mt-1">
                                                  Voir
                                                </Button>
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                  </div>
                          )}
                              </CardContent>
                            </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
              </TabsContent>

              {/* Wishlist Tab */}
              <TabsContent value="wishlist" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Heart className="h-5 w-5" />
                      <span>Ma Liste de Souhaits</span>
                      <Badge variant="outline">{wishlist.length}</Badge>
                    </CardTitle>
                    <CardDescription>Vos produits favoris sauvegardés</CardDescription>
                  </CardHeader>
                  <CardContent>
            {wishlist.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Heart className="h-12 w-12 text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Liste de souhaits vide</h3>
                        <p className="text-gray-500 mb-6">Ajoutez vos produits préférés !</p>
                        <Link href="/products">
                          <Button className="bg-red-600 hover:bg-red-700">
                            <Heart className="h-4 w-4 mr-2" />
                            Découvrir nos produits
                          </Button>
                        </Link>
                </div>
            ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlist.map((item) => (
                          <Card key={item.id} className="group hover:shadow-lg transition-all duration-300">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                    {item.product.image ? (
                                      <img 
                                        src={(item.product as any)?.imageUrl || `/${(item.product as any)?.image}`} 
                                        alt={item.product.name} 
                                        className="w-full h-full object-cover rounded" 
                          />
                        ) : (
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                                    )}
                        </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold truncate">{item.product.name}</h4>
                                    <p className="text-lg font-bold text-red-600">{formatCurrency(item.product.price)} MAD</p>
                                  </div>
                          </div>
                                
                                <div className="flex space-x-2">
                                  <Link href={item.product.slug ? `/product/${item.product.slug}` : `/product/${item.product.id}`}>
                                    <Button variant="outline" size="sm" className="flex-1">
                                      Voir le produit
                                    </Button>
                          </Link>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveFromWishlist(item.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                        </Button>
                  </div>
                              </div>
                            </CardContent>
                          </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
              </TabsContent>

            </Tabs>
      </div>
        </div>
      </div>
    </div>
  );
}