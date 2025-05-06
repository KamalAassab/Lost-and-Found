import React, { useState } from "react";
import { Link } from "wouter";
import { X, Heart, Check, Truck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ProductQuickViewProps {
  product: {
    id: number;
    name: string;
    slug: string;
    imageUrl: string;
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
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "M");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

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
      imageUrl: product.imageUrl,
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          <div>
            <img
              src={product.imageUrl}
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
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`border px-3 py-1 text-sm ${
                      selectedSize === size
                        ? "border-primary bg-primary text-white"
                        : "border-neutral-300 hover:border-primary"
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
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
                variant="outline"
                className="w-12 h-12 flex items-center justify-center border border-neutral-300 hover:border-primary hover:text-primary transition duration-300"
              >
                <Heart className="h-5 w-5" />
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

            <div className="mt-4 pt-4 border-t border-neutral-200">
              <Link href={`/product/${product.slug}`} className="text-primary hover:underline font-medium">
                Voir les détails du produit
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
