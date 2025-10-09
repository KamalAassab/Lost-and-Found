import React, { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, Check, Heart, Truck, RefreshCw } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { AuthPopup } from "@/components/auth/AuthPopup";

// Define product interface for stronger typing
interface Product {
  id: number;
  name: string;
  slug: string;
  imageUrl: string;
  price: string | number;
  oldPrice?: string | number | null;
  description: string;
  category: string | { name: string; id: number; slug: string; };
  sizes: string[];
}

export default function ProductDetailPage() {
  const [, params] = useRoute("/product/:slug");
  const slug = params?.slug;
  const [, navigate] = useLocation();
  
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isAddingWishlist, setIsAddingWishlist] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const { user } = useAuth();
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  // Check if this is static deployment

  // Fetch product details
  const { data: apiProduct, isLoading: isLoadingProduct } = useQuery<Product>({
    queryKey: [`/api/products/${slug}`],
    enabled: !!slug,
  });

  // Get product from API
  const product = apiProduct;

  // Fetch related products
  const { data: apiRelatedProducts = [], isLoading: isLoadingRelated } = useQuery<Product[]>({
    queryKey: ['/api/products', { category: product?.category }],
    enabled: !!product?.category,
  });

  // Get related products from API
  const relatedProducts = apiRelatedProducts;

  // Set page title
  React.useEffect(() => {
    if (product) {
      document.title = `${product.name} | LOST & FOUND`;
    }
  }, [product]);

  // Fetch wishlist on mount to check if product is already in wishlist
  useEffect(() => {
    async function checkWishlist() {
      if (!product) return;
      try {
        const wishlist = await apiRequest("GET", "/api/wishlist");
        setWishlistAdded(wishlist.some((item: any) => item.productId === product.id));
      } catch {}
    }
    checkWishlist();
  }, [product]);

  const handleAddToCart = () => {
    if (!product || !selectedSize) return;
    
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
    if (!product) return;
    
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

  if (!isStaticDeployment && isLoadingProduct) {
    return (
      <MainLayout>
        <div className="container mx-auto py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Skeleton className="h-[500px] w-full" />
            <div>
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/4 mb-6" />
              <Skeleton className="h-24 w-full mb-8" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full mb-8" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Produit non trouvé</h2>
          <p className="mb-6">Le produit que vous recherchez n'existe pas ou a été supprimé.</p>
          <Button onClick={() => navigate("/products")}>
            Voir tous les produits
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Ensure sizes is always an array (robust)
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
      console.error("[ProductDetailPage] JSON parse error:", e, product.sizes);
      sizes = [];
    }
  } else {
    sizes = [];
  }
  // Fallback: if no sizes, enable all
  if (sizes.length === 0) {
    sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  }

  const hasDiscount = product.oldPrice != null;
  const discountPercentage = hasDiscount
    ? Math.round(((Number(product.oldPrice) - Number(product.price)) / Number(product.oldPrice)) * 100)
    : 0;

  // Always show all standard sizes, but only enable those available for this product
  const allSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  return (
    <MainLayout>
      <div className="container mx-auto py-12">
        {/* Breadcrumb */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate("/products")}
            className="mr-3 p-2 hover:bg-neutral-200 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center text-sm text-gray-500">
            <span className="mx-2">/</span>
            <span className="capitalize">{typeof product.category === 'object' ? (product.category?.name || '') : product.category}</span>
            <span className="mx-2">/</span>
            <span className="text-gray-700 font-medium">{product.name}</span>
          </div>
        </div>

        {/* Product details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product image */}
          <div className="relative">
            {hasDiscount && (
              <div className="absolute top-4 left-4 bg-accent text-white py-1 px-3 text-sm font-bold z-10">
                -{discountPercentage}%
              </div>
            )}
            <img
              src={`/uploads/${product.image}`}
              alt={product.name}
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Product info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center mb-6">
              <span className="text-accent font-bold text-2xl mr-3">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-neutral-500 line-through text-lg">
                  {formatPrice(product.oldPrice!)}
                </span>
              )}
            </div>

            <p className="text-neutral-600 mb-8">
              {product.description}
            </p>

            {/* Size selection */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Taille</h3>
              <div className="flex flex-wrap gap-2">
                {allSizes.map((size) => {
                  const available = sizes.includes(size);
                  return (
                    <button
                      key={size}
                      className={`border px-4 py-2 text-sm ${
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
              {!selectedSize && (
                <p className="text-red-500 text-sm mt-2">
                  Veuillez sélectionner une taille
                </p>
              )}
            </div>

            {/* Quantity selection */}
            <div className="mb-8">
              <h3 className="font-semibold mb-2">Quantité</h3>
              <div className="flex items-center border border-neutral-300 w-max">
                <button
                  className="px-4 py-2 text-sm hover:bg-neutral-100"
                  onClick={decreaseQuantity}
                >
                  -
                </button>
                <span className="px-6 py-2 text-sm border-l border-r border-neutral-300">
                  {quantity}
                </span>
                <button
                  className="px-4 py-2 text-sm hover:bg-neutral-100"
                  onClick={increaseQuantity}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to cart and wishlist */}
            <div className="flex space-x-4 mb-8">
              <Button
                className="flex-grow bg-primary text-white py-3 font-bold uppercase text-sm tracking-wider hover:bg-neutral-800 transition duration-300"
                onClick={handleAddToCart}
                disabled={!selectedSize}
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

            {/* Product information */}
            <div className="border-t border-neutral-200 pt-6">
              <div className="flex items-center mb-3">
                <Check className="text-green-500 mr-2 h-5 w-5" />
                <span>En stock - Expédition sous 24h</span>
              </div>
              <div className="flex items-center mb-3">
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

        {/* Related products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Vous aimerez aussi</h2>
            
            {isLoadingRelated ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="bg-white">
                    <Skeleton className="h-[300px] w-full" />
                    <div className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts
                  .filter((p: Product) => p.id !== product.id)
                  .slice(0, 4)
                  .map((relatedProduct: Product) => (
                    <ProductCard key={relatedProduct.id} product={relatedProduct} />
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      <AuthPopup 
        open={showAuthPopup} 
        onClose={() => setShowAuthPopup(false)} 
      />
    </MainLayout>
  );
}
