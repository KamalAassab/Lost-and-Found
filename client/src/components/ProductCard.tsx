import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { ProductQuickView } from "@/components/product/ProductQuickView";
import { EyeIcon, ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    imageUrl: string;
    price: string | number;
    oldPrice?: string | number | null;
    category: string;
    sizes: string[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [showQuickView, setShowQuickView] = React.useState(false);
  const { addToCart } = useCart();

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
      addToCart({
        productId: product.id,
        quantity: 1,
        size: "M", // Default size
        price: Number(product.price),
        name: product.name,
        imageUrl: product.imageUrl,
        category: product.category
      });
    }
  };

  return (
    <>
      <div className="bg-white product-card relative group">
        <Link href={`/product/${product.slug}`}>
          <a className="block">
            <div className="relative overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-[300px] object-cover product-image transition-opacity duration-300"
              />
              {hasDiscount && (
                <div className="absolute top-0 left-0 bg-accent text-white py-1 px-3 text-xs font-bold">
                  -{discountPercentage}%
                </div>
              )}
              <div className="hover-show opacity-0 absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-70 text-white flex gap-2 transition-all">
                <Button 
                  className="flex-1 bg-white text-primary text-sm uppercase font-bold hover:bg-neutral-100"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Ajouter
                </Button>
                <Button 
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white hover:text-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowQuickView(true);
                  }}
                >
                  <EyeIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <div className="flex items-center mt-1">
                <span className="text-accent font-bold">{formatPrice(product.price)}</span>
                {hasDiscount && (
                  <span className="text-neutral-500 line-through ml-2 text-sm">
                    {formatPrice(product.oldPrice!)}
                  </span>
                )}
              </div>
            </div>
          </a>
        </Link>
      </div>

      {showQuickView && (
        <ProductQuickView
          product={product}
          open={showQuickView}
          onClose={() => setShowQuickView(false)}
        />
      )}
    </>
  );
}
