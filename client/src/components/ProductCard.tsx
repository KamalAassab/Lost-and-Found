import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { ProductQuickView } from "@/components/product/ProductQuickView";
import { EyeIcon, ShoppingBag, Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthPopup } from "@/components/auth/AuthPopup";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    image: string;
    price: string | number;
    oldPrice?: string | number | null;
    category: string | { name: string; id: number; slug: string; };
    sizes: string[];
  };
  compact?: boolean;
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const [showQuickView, setShowQuickView] = React.useState(false);
  const [showAuthPopup, setShowAuthPopup] = React.useState(false);
  const [isAddingWishlist, setIsAddingWishlist] = React.useState(false);
  const [wishlistAdded, setWishlistAdded] = React.useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const hasDiscount = product.oldPrice != null;
  const discountPercentage = hasDiscount
    ? Math.round(((Number(product.oldPrice) - Number(product.price)) / Number(product.oldPrice)) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If product has sizes, show quick view to select size
    if (product.sizes && product.sizes.length > 0) {
      setShowQuickView(true);
    } else {
      // If no sizes, add default size
      const categoryValue = typeof product.category === 'object' 
        ? product.category.name 
        : product.category;
      
      addToCart({
        productId: product.id,
        quantity: 1,
        size: "M", // Default size
        price: Number(product.price),
        name: product.name,
        imageUrl: product.image,
        category: categoryValue
      });
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  // Compact style classes
  const cardPadding = compact ? "p-3" : "p-4 flex flex-col items-start w-full";
  const imageHeight = compact ? "h-[120px] md:h-[140px] xl:h-[150px]" : "h-[260px]";
  const titleClass = compact ? "font-semibold text-xs text-black mb-1 truncate w-full" : "text-lg font-medium mb-2 group-hover:text-black transition-colors duration-300";
  const priceClass = compact ? "text-accent font-bold text-base" : "text-xl font-bold";
  const oldPriceClass = compact ? "text-neutral-400 line-through text-xs" : "text-neutral-500 line-through text-sm";
  const buttonSize = compact ? "w-8 h-8" : "w-10 h-10";
  const iconSize = compact ? 16 : 20;

  return (
    <>
      <div className={`bg-white group relative rounded-xl shadow-md border border-neutral-200 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:border-black ${compact ? 'text-xs' : ''}`}>
        <div className={`relative overflow-hidden bg-neutral-100 flex items-center justify-center ${imageHeight}`}>
          <Link href={`/product/${product.slug}`} className="block w-full h-full">
            <img
              src={`/uploads/${product.image}`}
              alt={product.name}
              className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 ${compact ? '' : ''}`}
              style={compact ? { maxHeight: 150 } : {}}
            />
            {hasDiscount && (
              <div className={`absolute top-2 left-2 bg-accent text-white py-1 px-2 ${compact ? 'text-[10px] rounded' : 'text-xs font-bold rounded-lg'} shadow`}>
                -{discountPercentage}%
              </div>
            )}
          </Link>
          {/* Hover overlay for action buttons */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <div className="flex gap-2">
              {/* Show only quick view and wishlist buttons for all cards */}
              <Button
                className={`${buttonSize} flex items-center justify-center bg-white text-black hover:bg-black hover:text-white rounded-full p-0 transition-colors duration-200 border border-black shadow`}
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowQuickView(true);
                }}
                aria-label="Voir le produit"
              >
                <EyeIcon className="h-4 w-4" style={{ width: iconSize, height: iconSize }} />
              </Button>
              <Button
                className={`${buttonSize} flex items-center justify-center bg-white text-black hover:bg-black hover:text-white rounded-full p-0 transition-colors duration-200 border border-black shadow`}
                onClick={handleToggleWishlist}
                disabled={isAddingWishlist}
                aria-label={wishlistAdded ? "Retirer de la liste de souhaits" : "Ajouter à la liste de souhaits"}
              >
                <Heart className={`h-4 w-4 ${wishlistAdded ? 'fill-current' : ''}`} style={{ width: iconSize, height: iconSize }} />
              </Button>
            </div>
          </div>
        </div>
        <div className={cardPadding}>
          <Link href={`/product/${product.slug}`} className="block w-full">
            <h3 className={titleClass} title={product.name}>{product.name}</h3>
          </Link>
          <div className="flex items-center gap-2 w-full mt-1">
            <span className={priceClass}>{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className={oldPriceClass}>{formatPrice(product.oldPrice!)}</span>
            )}
          </div>
        </div>
      </div>

      {showQuickView && (
        <ProductQuickView
          product={product}
          open={showQuickView}
          onClose={() => setShowQuickView(false)}
        />
      )}

      <AuthPopup 
        open={showAuthPopup} 
        onClose={() => setShowAuthPopup(false)} 
      />
    </>
  );
}
