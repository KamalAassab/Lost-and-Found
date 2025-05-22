import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { X, Heart, Check, Truck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { AuthPopup } from "@/components/auth/AuthPopup";

interface ProductQuickViewProps {
  product: {
    id: number;
    name: string;
    slug: string;
    image: string;
    price: string | number;
    oldPrice?: string | number | null;
    category: string | { name: string; id: number; slug: string; };
    sizes: string[];
    description?: string;
  };
  open: boolean;
  onClose: () => void;
}

export function ProductQuickView({ product, open, onClose }: ProductQuickViewProps) {
  // Robustly parse sizes
  let sizes: string[] = [];
  if (Array.isArray(product.sizes)) {
    sizes = product.sizes;
  } else if (typeof product.sizes === "string") {
    try {
      // Try parsing once
      sizes = JSON.parse(product.sizes);
      // If the result is still a string, parse again (handles double-stringified)
      if (typeof sizes === "string") {
        sizes = JSON.parse(sizes);
      }
      if (!Array.isArray(sizes)) sizes = [];
    } catch (e) {
      console.error("[ProductQuickView] JSON parse error:", e, product.sizes);
      sizes = [];
    }
  } else {
    sizes = [];
  }

  // Show all possible sizes for selection
  const allSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  // Debug log for raw and parsed sizes
  console.log("[ProductQuickView] RAW product.sizes:", product.sizes);
  console.log("[ProductQuickView] Parsed sizes for product:", product.name, sizes);

  const [selectedSize, setSelectedSize] = useState(allSizes[0]);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isAddingWishlist, setIsAddingWishlist] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const { user } = useAuth();
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  // Fetch wishlist on mount and when popup opens to check if product is already in wishlist
  useEffect(() => {
    async function checkWishlist() {
      if (!open || !product) return;
      try {
        const wishlist = await apiRequest("GET", "/api/wishlist");
        setWishlistAdded(wishlist.some((item: any) => item.productId === product.id));
      } catch {}
    }
    checkWishlist();
  }, [product, open]);

  const handleAddToCart = () => {
    const categoryValue = typeof product.category === 'object' 
      ? product.category.name 
      : product.category;
      
    addToCart({
      productId: product.id,
      quantity,
      size: selectedSize,
      price: Number(product.price),
      name: product.name,
      imageUrl: `/uploads/${product.image}`,
      category: categoryValue
    });
    onClose();
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      setShowAuthPopup(true);
      return;
    }

    setIsAddingWishlist(true);
    try {
      if (wishlistAdded) {
        await apiRequest("DELETE", `/api/wishlist/${product.id}`);
        setWishlistAdded(false);
        toast({ title: "Retiré de la liste de souhaits", description: "Ce produit a été retiré de votre liste de souhaits." });
      } else {
        await apiRequest("POST", "/api/wishlist", { productId: product.id });
        setWishlistAdded(true);
        toast({ title: "Ajouté à la liste de souhaits", description: "Ce produit a été ajouté à votre liste de souhaits." });
      }
    } catch (error: any) {
      toast({ title: "Erreur", description: error?.message || "Erreur lors de la mise à jour de la liste de souhaits", variant: "destructive" });
    } finally {
      setIsAddingWishlist(false);
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
          <DialogDescription>
            Aperçu rapide du produit
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 max-h-[70vh] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
          <div>
            <img
              src={`/uploads/${(product as any).image || (product as any).imageUrl}`}
              alt={product.name}
              className="w-full h-auto object-cover"
            />
          </div>

          <div>
            <div className="flex items-center mb-4">
              <span className="text-accent font-bold text-xl mr-3">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-neutral-500 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>

            <p className="text-neutral-600 mb-6">
              {product.description || 
                "Hoodie streetwear premium avec un design urbain minimaliste. Fabriqué en coton de haute qualité pour un confort optimal au quotidien."}
            </p>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Taille</h3>
              <div className="flex flex-wrap gap-2">
                {allSizes.map((size) => {
                  const available = sizes.includes(size);
                  return (
                  <button
                    key={size}
                    className={`border px-3 py-1 text-sm ${
                        selectedSize === size && available
                        ? "border-primary bg-primary text-white"
                          : available
                            ? "border-neutral-300 hover:border-primary"
                            : "border-neutral-200 text-neutral-400 cursor-not-allowed bg-neutral-100"
                    }`}
                      onClick={() => available && setSelectedSize(size)}
                      disabled={!available}
                      type="button"
                  >
                    {size}
                  </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Quantité</h3>
              <div className="flex items-center border border-neutral-300 w-max">
                <button
                  className="px-3 py-2 text-sm hover:bg-neutral-100"
                  onClick={decreaseQuantity}
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm border-l border-r border-neutral-300">
                  {quantity}
                </span>
                <button
                  className="px-3 py-2 text-sm hover:bg-neutral-100"
                  onClick={increaseQuantity}
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                className="flex-grow bg-primary text-white py-3 font-bold uppercase text-sm tracking-wider hover:bg-neutral-800 transition duration-300"
                onClick={handleAddToCart}
              >
                Ajouter au panier
              </Button>
              <Button
                variant={wishlistAdded ? "default" : "outline"}
                className={`w-12 h-12 flex items-center justify-center border border-neutral-300 transition duration-300 ${wishlistAdded ? 'bg-primary text-white border-primary' : 'hover:border-primary hover:text-primary'}`}
                onClick={handleToggleWishlist}
                disabled={isAddingWishlist}
                aria-label={wishlistAdded ? "Retirer de la liste de souhaits" : "Ajouter à la liste de souhaits"}
              >
                <Heart className={`h-5 w-5 ${wishlistAdded ? 'fill-current' : ''}`} />
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200">
              <div className="flex items-center mb-2">
                <Check className="text-green-500 mr-2 h-5 w-5" />
                <span>En stock - Expédition sous 24h</span>
              </div>
              <div className="flex items-center mb-2">
                <Truck className="text-neutral-500 mr-2 h-5 w-5" />
                <span>Livraison gratuite pour les commandes de plus de 500 MAD</span>
              </div>
              <div className="flex items-center">
                <RefreshCw className="text-neutral-500 mr-2 h-5 w-5" />
                <span>Retours gratuits sous 30 jours</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

      <AuthPopup 
        open={showAuthPopup} 
        onClose={() => setShowAuthPopup(false)} 
      />
    </>
  );
}
