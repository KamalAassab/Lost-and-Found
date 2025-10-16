import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { ProductQuickView } from "@/components/product/ProductQuickView";
import { ShoppingBag } from "lucide-react";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    imageUrl: string;
    price: string | number;
    oldPrice?: string | number | null;
    category: string | { name: string; id: number; slug: string; };
    sizes: string[];
  };
  compact?: boolean;
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
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
      const categoryValue = typeof product.category === 'object' 
        ? product.category.name 
        : product.category;
      
      addToCart({
        productId: product.id,
        quantity: 1,
        size: "M", // Default size
        price: Number(product.price),
        name: product.name,
        imageUrl: product.imageUrl,
        category: categoryValue
      });
    }
  };


  // Compact and elegant style classes
  const cardPadding = compact ? "p-4" : "p-6 flex flex-col items-start w-full";
  const imageHeight = compact ? "h-[180px] md:h-[200px] xl:h-[220px]" : "h-[300px]";
  const titleClass = compact ? "font-semibold text-sm text-gray-900 mb-2 line-clamp-2 leading-tight" : "text-xl font-semibold mb-3 group-hover:text-black transition-colors duration-300";
  const priceClass = compact ? "text-black font-bold text-lg" : "text-2xl font-bold";
  const oldPriceClass = compact ? "text-gray-400 line-through text-sm" : "text-gray-500 line-through text-lg";
  const buttonSize = compact ? "w-8 h-8" : "w-10 h-10";
  const iconSize = compact ? 16 : 20;

  return (
    <>
      <div className={`bg-white group relative rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 hover:border-gray-300 ${compact ? 'text-base' : ''}`}>
        {/* Spacious image container */}
        <div className={`relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center ${imageHeight}`}>
          <Link href={`/product/${product.slug}`} className="block w-full h-full group/image">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-contain transition-all duration-500 group-hover/image:scale-105"
              style={compact ? { maxHeight: 250 } : {}}
            />
            {/* Elegant discount badge */}
            {hasDiscount && (
              <div className={`absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 ${compact ? 'text-sm rounded-xl' : 'text-base font-bold rounded-2xl'} shadow-xl backdrop-blur-sm border border-red-400/30`}>
                -{discountPercentage}%
              </div>
            )}
            {/* Subtle overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/3 transition-all duration-500"></div>
          </Link>
        </div>
        
        {/* Spacious content area */}
        <div className={cardPadding}>
          <Link href={`/product/${product.slug}`} className="block w-full group/title">
            <h3 className={`${titleClass} group-hover/title:text-gray-800 transition-colors duration-300`} title={product.name}>
              {product.name}
            </h3>
          </Link>
          
          {/* Compact price section */}
          <div className="flex items-center justify-between w-full mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`${priceClass} text-gray-900`}>{formatPrice(product.price)}</span>
              {hasDiscount && (
                <span className={`${oldPriceClass} text-gray-400`}>{formatPrice(product.oldPrice!)}</span>
              )}
            </div>
          </div>
          
          {/* Compact category badge */}
          <div className="mt-3">
            <span className="inline-block text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 uppercase">
              {typeof product.category === 'object' ? product.category.name : product.category}
            </span>
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

    </>
  );
}
