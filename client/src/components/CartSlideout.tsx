import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { ShoppingBag, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

interface CartSlideoutProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSlideout({ isOpen, onClose }: CartSlideoutProps) {
  const [, navigate] = useLocation();
  const { cartItems, removeFromCart, updateCartItemQuantity, cartTotal, freeShipping } = useCart();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    
    // Prevent scrolling when cart is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCheckout = () => {
    navigate("/checkout");
    onClose();
  };

  const handleContinueShopping = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}>
      <div 
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-lg transform transition-transform duration-300" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-neutral-200">
          <h3 className="font-bold text-xl flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Votre Panier ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {cartItems.length === 0 ? (
          <div className="p-8 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium mb-2">Votre panier est vide</h4>
            <p className="text-sm text-gray-500 mb-6">
              Parcourez notre collection et ajoutez des articles à votre panier.
            </p>
            <Button 
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={handleContinueShopping}
            >
              Continuer les achats
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-4">
                {cartItems.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex py-4 border-b border-neutral-200">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 object-cover"
                    />
                    <div className="ml-4 flex-grow">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-neutral-500">Taille: {item.size}</p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center border border-neutral-200">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="px-2 h-8"
                            onClick={() => updateCartItemQuantity(item.productId, item.size, Math.max(1, item.quantity - 1))}
                          >
                            -
                          </Button>
                          <span className="px-2 py-1 text-sm">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="px-2 h-8"
                            onClick={() => updateCartItemQuantity(item.productId, item.size, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <p className="font-bold">
                          {item.isFree ? (
                            <>
                              0 MAD <span className="text-accent text-xs">GRATUIT</span>
                            </>
                          ) : (
                            formatPrice(item.price * item.quantity)
                          )}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-neutral-400 hover:text-neutral-700"
                      onClick={() => removeFromCart(item.productId, item.size)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-neutral-200 bg-neutral-100">
              <div className="flex justify-between mb-2">
                <span>Sous-total</span>
                <span className="font-bold">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Livraison</span>
                <span className="font-bold text-accent">
                  {freeShipping ? "GRATUITE" : formatPrice(50)}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between mb-4">
                <span className="font-bold">Total</span>
                <span className="font-bold text-lg">
                  {formatPrice(freeShipping ? cartTotal : cartTotal + 50)}
                </span>
              </div>

              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 font-bold uppercase text-sm tracking-wider mb-2"
                onClick={handleCheckout}
              >
                Passer à la caisse
              </Button>
              <Button 
                variant="outline"
                className="w-full border border-primary text-primary py-3 font-bold uppercase text-sm tracking-wider hover:bg-neutral-100"
                onClick={handleContinueShopping}
              >
                Continuer les achats
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
