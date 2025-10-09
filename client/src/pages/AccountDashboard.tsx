import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Heart, ShoppingBag, LogOut, Image as ImageIcon, UserCircle, Pencil, Trash2, Check, X, ShoppingCart, MapPin, Phone, Mail, Home, Eye, EyeOff, Package, Lock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation, Link } from "wouter";
import { ShopLogo } from "@/components/ui/shop-logo";

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
  items?: OrderItem[];
}

interface WishlistItem {
  id: number;
  productId: number;
  product?: {
    name: string;
    price: number;
    image?: string;
  };
}

// List of major Moroccan cities (sorted A-Z)
const MOROCCO_CITIES = [
  "Casablanca", "Rabat", "Fès", "Marrakech", "Agadir", "Tangier", "Meknès", "Oujda", "Kenitra", "Tetouan", "Safi", "Mohammedia", "Khouribga", "El Jadida", "Beni Mellal", "Aït Melloul", "Nador", "Taza", "Settat", "Berrechid", "Khemisset", "Inezgane", "Ksar El Kebir", "Larache", "Guelmim", "Khenifra", "Berkane", "Taourirt", "Bouskoura", "Fquih Ben Salah", "Dcheira El Jihadia", "Oued Zem", "Sidi Slimane", "Errachidia", "Guercif", "Oued Zem", "Sidi Kacem", "Taroudant", "Essaouira", "Tiflet", "Sidi Bennour", "Tiznit", "Tan-Tan", "Ouazzane", "Sefrou", "Youssoufia", "Martil", "Ain Harrouda", "Ait Ourir", "Ain El Aouda", "Ain Taoujdate", "Azrou", "Beni Ansar", "Beni Yakhlef", "Ben Guerir", "Boujdour", "Bouknadel", "Boulemane", "Bouznika", "Chefchaouen", "Demnate", "Drarga", "El Aioun Sidi Mellouk", "El Hajeb", "El Kelaa des Sraghna", "El Ksiba", "Fnideq", "Harhoura", "Imzouren", "Jerada", "Kasba Tadla", "Ksar es Souk", "Laayoune", "Lqliaa", "M'diq", "Midelt", "Ouarzazate", "Oulad Teima", "Oulad Tayeb", "Oulad Yaich", "Sidi Ifni", "Skhirat", "Souk El Arbaa", "Tamesna", "Taza", "Zagora"
].sort((a, b) => a.localeCompare(b));

export default function AccountDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({ username: "", fullname: "", phone: "", address: "", city: "", postalCode: "", email: "" });
  const [, setLocation] = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // Always try to fetch user info first
        const userData = await apiRequest("GET", "/api/me");
        if (mounted) setUserInfo({
          username: userData.username || "",
          fullname: userData.fullname || "",
          phone: userData.phone || "",
          address: userData.address || "",
          city: userData.city || "",
          postalCode: userData.postalCode || "",
          email: userData.email || "",
        });

        // Fetch orders and wishlist in parallel, and show error toasts if they fail
        const [ordersData, wishlistData] = await Promise.all([
          apiRequest("GET", "/api/my-orders").catch((err) => { toast({ title: "Erreur", description: "Impossible de charger vos commandes", variant: "destructive" }); return []; }),
          apiRequest("GET", "/api/wishlist").catch((err) => { toast({ title: "Erreur", description: "Impossible de charger votre liste de souhaits", variant: "destructive" }); return []; }),
        ]);
        if (mounted) {
        setOrders(ordersData);
        setWishlist(wishlistData);
        }
      } catch (error) {
         if (mounted) {
           toast({ title: "Erreur", description: "Impossible de charger vos informations", variant: "destructive" });
         }
      } finally {
         if (mounted) setIsLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    } else {
      // (9) Redirect if not authenticated
      setLocation("/login");
    }

    return () => { mounted = false; };
  }, [user, setLocation, toast]);

  const handleUpdateInfo = async () => {
    setIsSaving(true);
    try {
      const res = await apiRequest("PUT", "/api/me", userInfo);
      // (8) Display backend error message if available (e.g. res.error)
      if (res && res.error) {
         toast({ title: "Erreur", description: res.error, variant: "destructive" });
      } else {
      setIsEditing(false);
         toast({ title: "Succès", description: "Vos informations ont été mises à jour" });
         // (2) Re-fetch user info after update
         const userData = await apiRequest("GET", "/api/me");
         setUserInfo({
           username: userData.username || "",
           fullname: userData.fullname || "",
           phone: userData.phone || "",
           address: userData.address || "",
           city: userData.city || "",
           postalCode: userData.postalCode || "",
           email: userData.email || "",
      });
      }
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de mettre à jour vos informations", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  // Helper for status badge color and label (French, colorful)
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold border-2 border-yellow-400 bg-yellow-100 text-yellow-800 shadow-sm text-center">En attente</span>;
      case "processing":
        return <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold border-2 border-blue-400 bg-blue-100 text-blue-800 shadow-sm text-center">En traitement</span>;
      case "shipped":
        return <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold border-2 border-purple-400 bg-purple-100 text-purple-800 shadow-sm text-center">Expédiée</span>;
      case "delivered":
        return <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold border-2 border-green-500 bg-green-100 text-green-800 shadow-sm text-center">Livrée</span>;
      case "cancelled":
        return <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold border-2 border-red-400 bg-red-100 text-red-800 shadow-sm text-center">Annulée</span>;
      default:
        return <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold border-2 border-gray-400 bg-gray-100 text-gray-700 shadow-sm text-center">{status}</span>;
    }
  };

  // Helper to format date as DD/MM/YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Add handler to remove from wishlist
  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await apiRequest("DELETE", `/api/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((item) => item.productId !== productId));
      toast({ title: "Retiré de la liste de souhaits", description: "Ce produit a été retiré de votre liste de souhaits." });
    } catch (error: any) {
      toast({ title: "Erreur", description: error?.message || "Impossible de retirer de la liste de souhaits", variant: "destructive" });
    }
  };

  // Replace the validatePassword function with this simpler version
  const validatePassword = () => {
    if (currentPassword === newPassword) {
      setPasswordError("Le nouveau mot de passe doit être différent de l'ancien");
      return false;
    }
    setPasswordError("");
    return true;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 to-neutral-200 font-sans">
      {/* Header */}
      <header className="bg-black shadow-sm py-4 px-6 flex items-center justify-between rounded-b-2xl">
        <Link href="/">
          <a className="flex items-center gap-2">
            <ShopLogo className="h-10 w-auto text-white" />
            <span className="sr-only">Accueil</span>
          </a>
        </Link>
        {user && (
          <Button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white text-black border-none shadow hover:shadow-lg hover:bg-neutral-100 transition-colors px-4 py-2 rounded-lg"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </Button>
        )}
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Profile Card */}
          <Card className={`shadow-2xl rounded-3xl p-0 transition-all duration-300 ${isEditing ? 'ring-2 ring-primary/40 bg-primary/5' : 'bg-white/90' } animate-fade-in max-w-2xl w-full mx-auto`}>
            <CardContent className="pt-6 pb-4 px-4">
              <div className="flex flex-col items-center mb-4">
                <span className="block text-2xl font-extrabold tracking-tight text-black mb-2">Bienvenue,</span>
                <h2 className="text-2xl font-extrabold tracking-tight text-black text-center">{userInfo.fullname || userInfo.username}</h2>
                <span className="text-gray-400 text-sm">@{userInfo.username}</span>
                {isEditing && (
                  <span className="mt-2 px-3 py-1 text-xs rounded-full bg-primary/10 text-primary font-semibold flex items-center gap-1 animate-pulse">
                    <Pencil className="h-4 w-4" /> Édition en cours
                  </span>
                )}
              </div>
              <div className="bg-white rounded-2xl shadow-inner p-6">
            {isEditing ? (
              <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="relative w-full flex items-center gap-2">
                        <User className="h-5 w-5 text-primary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <Input value={userInfo.username || ""} onChange={e => setUserInfo({ ...userInfo, username: e.target.value })} placeholder="Nom d'utilisateur" className="border rounded pl-10 py-2 w-full pr-8 bg-neutral-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <div className="relative w-full flex items-center gap-2">
                        <User className="h-5 w-5 text-primary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <Input value={userInfo.fullname || ""} onChange={e => setUserInfo({ ...userInfo, fullname: e.target.value })} placeholder="Nom complet" className="border rounded pl-10 py-2 w-full pr-8 bg-neutral-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <div className="relative w-full flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <Input value={userInfo.email || ""} disabled placeholder="Email" className="border rounded pl-10 py-2 w-full pr-8 bg-neutral-100 text-sm text-gray-900 cursor-not-allowed" />
                      </div>
                      <div className="relative w-full flex items-center gap-2">
                        <Phone className="h-5 w-5 text-primary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <Input value={userInfo.phone || ""} onChange={e => setUserInfo({ ...userInfo, phone: e.target.value })} placeholder="Téléphone" className="border rounded pl-10 py-2 w-full pr-8 bg-neutral-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <div className="relative w-full flex items-center gap-2">
                        <Home className="h-5 w-5 text-primary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <Input value={userInfo.address || ""} onChange={e => setUserInfo({ ...userInfo, address: e.target.value })} placeholder="Adresse" className="border rounded pl-10 py-2 w-full pr-8 bg-neutral-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <div className="relative w-full flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          value={userInfo.city || ""}
                          onChange={e => setUserInfo({ ...userInfo, city: e.target.value })}
                          className="border rounded pl-10 py-2 w-full pr-8 bg-neutral-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                        >
                          <option value="">Sélectionnez une ville</option>
                          {MOROCCO_CITIES.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                      <div className="relative w-full flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <Input value={userInfo.postalCode || ""} onChange={e => setUserInfo({ ...userInfo, postalCode: e.target.value })} placeholder="Code Postal" className="border rounded pl-10 py-2 w-full pr-8 bg-neutral-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-2 items-center w-full max-w-xs">
                      <div className="relative w-full flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={e => {
                            setCurrentPassword(e.target.value);
                            setPasswordError("");
                          }}
                          placeholder="Mot de passe actuel"
                          className="border rounded pl-10 py-2 w-full pr-8 bg-neutral-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                </div>
                      <div className="relative w-full flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={e => {
                            setNewPassword(e.target.value);
                            setPasswordError("");
                          }}
                          placeholder="Nouveau mot de passe"
                          className="border rounded pl-10 py-2 w-full pr-8 bg-neutral-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                </div>
                      {passwordError && (
                        <p className="text-red-500 text-sm text-center w-full">{passwordError}</p>
                      )}
                </div>
                    <div className="flex gap-2 justify-center mt-6">
                      <Button disabled={isSaving} onClick={handleUpdateInfo} aria-label="Enregistrer les informations" className="bg-primary text-white px-5 py-2 rounded-lg flex items-center gap-2 shadow hover:bg-primary/90 transition text-sm">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Enregistrer
                      </Button>
                      <Button variant="outline" onClick={() => { setIsEditing(false); setShowPasswordInput(false); }} aria-label="Annuler la modification" className="px-5 py-2 rounded-lg flex items-center gap-2 shadow hover:bg-neutral-100 transition text-sm">
                        <X className="h-4 w-4" /> Annuler
                  </Button>
                </div>
              </div>
            ) : (
                  <div className="space-y-4 text-gray-700">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-primary" />
                      <span className="font-medium text-base">@{userInfo.username || <span className='text-gray-400'>Nom d'utilisateur non renseigné</span>}</span>
                    </div>
                    <hr className="my-1 border-neutral-200" />
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-primary" />
                      <span className="font-medium text-base">{userInfo.fullname || <span className='text-gray-400'>Nom complet non renseigné</span>}</span>
                    </div>
                    <hr className="my-1 border-neutral-200" />
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 !text-black !opacity-100 stroke-2 fill-none" />
                      <span className="font-medium text-base">{userInfo.email || <span className='text-gray-400'>Email non renseigné</span>}</span>
                    </div>
                    <hr className="my-1 border-neutral-200" />
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="font-medium text-base">{userInfo.phone || <span className='text-gray-400'>Téléphone non renseigné</span>}</span>
                    </div>
                    <hr className="my-1 border-neutral-200" />
                    <div className="flex items-center gap-3">
                      <Home className="h-4 w-4 text-primary" />
                      <span className="font-medium text-base">{userInfo.address || <span className='text-gray-400'>Adresse non renseignée</span>}</span>
                    </div>
                    <hr className="my-1 border-neutral-200" />
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium text-base">{userInfo.city || <span className='text-gray-400'>Ville non renseignée</span>}</span>
                    </div>
                    <hr className="my-1 border-neutral-200" />
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-primary" />
                      <span className="font-medium text-base">{userInfo.postalCode || <span className='text-gray-400'>Code postal non renseigné</span>}</span>
                    </div>
                    <Button onClick={() => { setIsEditing(true); setShowPasswordInput(true); }} aria-label="Modifier les informations" className="mt-6 bg-primary text-white px-5 py-2 rounded-lg flex items-center gap-2 shadow hover:bg-primary/90 transition w-full">
                      <Pencil className="h-4 w-4" /> Modifier les informations
                    </Button>
                  </div>
                )}
              </div>
          </CardContent>
        </Card>

          {/* Orders Section */}
          <div className="md:col-span-2 flex flex-col gap-8">
            <Card className="shadow-2xl rounded-3xl bg-neutral-50">
              <CardContent className="pt-8 pb-6 px-8">
                <div className="flex items-center gap-3 mb-6">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold text-black">Mes Commandes</h2>
                </div>
            {orders.length === 0 ? (
                  <p className="text-gray-500 text-center">Aucune commande pour le moment.</p>
            ) : (
                  <div className="space-y-8 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar rounded-xl">
                    {orders
                      .slice()
                      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                      .map((order, idx) => (
                        <div key={order.id} className="bg-neutral-50 rounded-xl shadow-sm p-5 hover:shadow-md transition">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                            <div className="flex flex-col gap-1">
                              <span className="text-base font-semibold text-primary">Commande #{idx + 1}</span>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(order.status)}
                                <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-300">{formatDate(order.createdAt)}</span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 text-right">
                              <span className="font-bold text-base">{order.total} MAD</span>
                              <div className="flex flex-wrap gap-2 justify-end mt-1">
                                {order.paymentMethod && (
                                  <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                    {order.paymentMethod === 'credit_card' ? 'Carte bancaire' : 'À la livraison'}
                                  </span>
                                )}
                                {order.free_shipping ? (
                                  <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                    Livraison gratuite
                                  </span>
                                ) : (
                                  <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
                                    Frais de livraison : 50 MAD
                                  </span>
                                )}
                                {order.promoApplied && (
                                  <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
                                    Promotion appliquée
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {order.items && order.items.length > 0 && (
                            <div className="mt-3 flex flex-col gap-3">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 border rounded-lg p-3 bg-white shadow-sm hover:shadow transition w-full">
                                  {item.product?.image ? (
                                    <img src={window.location.hostname === 'kamalaassab.github.io' ? `/${item.product.image}` : `/uploads/${item.product.image}`} alt={item.product.name} className="w-16 h-16 object-cover rounded-lg border" />
                                  ) : (
                                    <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded-lg border">
                                      <ImageIcon className="h-7 w-7 text-gray-400" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold break-words whitespace-normal text-sm">{item.product?.name || 'Produit inconnu'}</p>
                                    <p className="text-xs text-gray-500">Taille: {item.size} | Qté: {item.quantity}</p>
                                  </div>
                                  <div className="text-right flex flex-col items-end gap-1">
                                    <span className="font-semibold">{item.price * item.quantity} MAD</span>
                                    <span className="text-xs text-gray-500">{item.price} × {item.quantity}</span>
                                    {item.product && (
                                      <Link href={item.product.slug ? `/product/${item.product.slug}` : `/product/${item.productId}` }>
                                        <a className="mt-1 px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary/80 transition">Voir</a>
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

            {/* Wishlist Section */}
            <Card className="shadow-xl rounded-2xl bg-white">
              <CardContent className="pt-8 pb-6 px-8">
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold text-black">Ma Liste de Souhaits</h2>
                </div>
            {wishlist.length === 0 ? (
                  <p className="text-gray-500 text-center">Votre liste de souhaits est vide.</p>
            ) : (
                  <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                {wishlist.map((item) => (
                      <div key={item.id} className="border rounded-xl p-4 flex flex-col items-center bg-neutral-50 shadow-sm hover:shadow transition relative">
                        {item.product?.image ? (
                          <img
                            src={window.location.hostname === 'kamalaassab.github.io' ? `/${item.product.image}` : `/uploads/${item.product.image}`}
                            alt={item.product.name || "Produit"}
                            className="w-24 h-24 object-cover rounded-lg mb-2 border"
                          />
                        ) : (
                          <div className="w-24 h-24 flex items-center justify-center bg-gray-200 rounded-lg mb-2 border">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <p className="font-semibold text-center truncate w-full text-sm">{item.product?.name || "Produit inconnu"}</p>
                        <p className="text-primary font-bold mb-2 text-sm">{item.product?.price ? (item.product.price + " MAD") : "Prix non disponible"}</p>
                        <div className="flex flex-col items-center w-full mt-2">
                          <Link href={(item as any).product?.slug ? `/product/${(item as any).product.slug}` : `/product/${item.productId}`}>
                            <a className="inline-block px-3 py-1 text-xs font-medium text-primary border border-primary rounded hover:bg-primary hover:text-white transition w-full text-center">Voir la fiche produit</a>
                          </Link>
                        </div>
                        <Button size="icon" variant="ghost" className="absolute top-2 right-2 text-red-500 hover:text-red-700" title="Retirer de la liste" onClick={() => handleRemoveFromWishlist(item.productId)}>
                          <Trash2 className="h-5 w-5" />
                        </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
        </div>
      </main>
    </div>
  );
}
