import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { ShoppingBag, X, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-neutral-200">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Votre Panier ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
          </h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="hover:bg-black hover:text-white transition-all duration-300"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {cartItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 text-center"
          >
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium mb-2">Votre panier est vide</h4>
            <p className="text-sm text-gray-500 mb-6">
              Parcourez notre collection et ajoutez des articles à votre panier.
            </p>
            <Button 
              className="bg-black hover:bg-black/90 text-white transition-all duration-300 hover:scale-105"
              onClick={handleContinueShopping}
            >
              Continuer les achats
            </Button>
          </motion.div>
        ) : (
          <>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-6">
                <AnimatePresence>
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={`${item.productId}-${item.size}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex py-4 border-b border-neutral-200 last:border-b-0"
                    >
                      <motion.img
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg shadow-sm border"
                      />
                      <div className="ml-4 flex-grow">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-neutral-500">Taille: {item.size}</p>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8 rounded-full hover:bg-black hover:text-white transition-all duration-300"
                              onClick={() => updateCartItemQuantity(item.productId, item.size, Math.max(1, item.quantity - 1))}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="px-2 py-1 text-sm">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8 rounded-full hover:bg-black hover:text-white transition-all duration-300"
                              onClick={() => updateCartItemQuantity(item.productId, item.size, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
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
                        className="text-gray-400 hover:text-red-500 transition-all duration-300 hover:scale-105"
                        onClick={() => removeFromCart(item.productId, item.size)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>

            <div className="p-6 border-t border-neutral-200 bg-neutral-50">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-bold">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Livraison</span>
                <span className="font-bold text-accent">
                  {freeShipping ? "GRATUITE" : formatPrice(50)}
                </span>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between mb-6">
                <span className="font-bold">Total</span>
                <span className="font-bold text-lg">
                  {formatPrice(freeShipping ? cartTotal : cartTotal + 50)}
                </span>
              </div>

              <Button 
                className="w-full bg-black hover:bg-black/90 text-white py-3 font-bold uppercase text-sm tracking-wider mb-3 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                onClick={handleCheckout}
              >
                Passer à la caisse
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                className="w-full border border-black text-black py-3 font-bold uppercase text-sm tracking-wider hover:bg-neutral-100 transition-all duration-300"
                onClick={handleContinueShopping}
              >
                Continuer les achats
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
