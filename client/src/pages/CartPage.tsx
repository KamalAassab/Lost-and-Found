import React from "react";
import MainLayout from "@/layouts/MainLayout";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const { cartItems, cartTotal, removeFromCart, updateCartItemQuantity, freeShipping } = useCart();
  const [, navigate] = useLocation();
  const shippingCost = freeShipping ? 0 : 50;
  const totalCost = cartTotal + shippingCost;
  const [showPrompt, setShowPrompt] = useState(false);
  const { user } = useAuth();

  console.log("user in cart page:", user);

  if (cartItems.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto py-20 flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-full p-6 mb-6 shadow-lg"
          >
            <ShoppingBag className="w-12 h-12 text-accent" />
          </motion.div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold mb-2"
          >
            Votre panier est vide
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 mb-6"
          >
            Ajoutez des articles pour commencer votre shopping !
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button 
              size="lg" 
              className="px-8 py-3 text-base font-semibold bg-black hover:bg-black/90 text-white transition-all duration-300 hover:scale-105"
              onClick={() => navigate("/products")}
            >
              Voir les produits
            </Button>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 min-h-[90vh] py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl md:text-4xl font-extrabold mb-10 text-center tracking-tight"
          >
            Votre Panier
          </motion.h1>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Cart Items */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="md:col-span-2 bg-white p-6 rounded-xl shadow-lg"
            >
              <div className="space-y-6">
                <AnimatePresence>
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={`${item.productId}-${item.size}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex flex-col md:flex-row items-center gap-6 border-b last:border-b-0 pb-6 last:pb-0 group"
                    >
                      <motion.img 
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg shadow-sm border"
                      />
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
                        <div>
                          <p className="font-semibold text-lg mb-1">{item.name}</p>
                          <p className="text-sm text-gray-500 mb-2">Taille: <span className="font-medium">{item.size}</span></p>
                        </div>
                        <div className="flex items-center gap-2 mt-2 md:mt-0">
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="rounded-full hover:bg-black hover:text-white transition-all duration-300"
                            onClick={() => updateCartItemQuantity(item.productId, item.size, item.quantity - 1)} 
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-semibold text-base px-2">{item.quantity}</span>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="rounded-full hover:bg-black hover:text-white transition-all duration-300"
                            onClick={() => updateCartItemQuantity(item.productId, item.size, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-medium text-accent">{formatPrice(item.price * item.quantity)}</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-gray-400 hover:text-red-500 transition-all duration-300 hover:scale-105"
                          onClick={() => removeFromCart(item.productId, item.size)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
            {/* Summary */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-lg h-fit"
            >
              <h2 className="text-xl font-bold mb-6">Résumé de la commande</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Livraison</span>
                  {freeShipping ? (
                    <span className="text-accent font-medium">GRATUITE</span>
                  ) : (
                    <span className="font-medium">{formatPrice(shippingCost)}</span>
                  )}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-accent">{formatPrice(totalCost)}</span>
                </div>
              </div>
              <Button
                size="lg"
                className="w-full py-3 text-base font-semibold bg-black hover:bg-black/90 text-white transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                onClick={() => {
                  if (user) {
                    navigate('/checkout');
                  } else {
                    setShowPrompt(true);
                  }
                }}
              >
                Procéder au paiement
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
      {/* Account/Guest/Signin Prompt Dialog */}
      <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Comment souhaitez-vous continuer ?</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <Button 
              onClick={() => { setShowPrompt(false); navigate('/signup'); }} 
              variant="outline"
              className="hover:bg-black hover:text-white transition-all duration-300"
            >
              Créer un compte
            </Button>
            <Button 
              onClick={() => { setShowPrompt(false); navigate('/checkout'); }} 
              variant="default"
              className="bg-black hover:bg-black/90 text-white transition-all duration-300"
            >
              Continuer en tant qu'invité
            </Button>
            <Button 
              onClick={() => { setShowPrompt(false); navigate('/admin'); }} 
              variant="secondary"
              className="bg-gray-100 hover:bg-gray-200 text-black transition-all duration-300"
            >
              Déjà client ? Se connecter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
} 