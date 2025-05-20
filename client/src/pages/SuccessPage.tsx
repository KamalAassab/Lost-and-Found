import React, { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Home, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";

export default function SuccessPage() {
  const [, navigate] = useLocation();
  const { clearCart } = useCart();
  const hasClearedCart = useRef(false);

  // Set page title
  useEffect(() => {
    document.title = "Commande Réussie | LOST & FOUND";
  }, []);

  // Clear cart on mount
  useEffect(() => {
    if (!hasClearedCart.current) {
    clearCart();
      hasClearedCart.current = true;
    }
  }, [clearCart]);

  return (
    <MainLayout>
      <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 min-h-[90vh] py-20">
        <div className="container mx-auto max-w-3xl px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative inline-block mb-8"
            >
              <div className="absolute inset-0 bg-green-100 rounded-full blur-xl opacity-50" />
              <CheckCircle className="h-20 w-20 text-green-500 relative z-10" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Merci pour votre commande !
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-lg text-gray-600 mb-8"
            >
              Votre commande a été reçue et est en cours de traitement. Vous recevrez un email 
              de confirmation avec tous les détails.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                className="bg-black hover:bg-black/90 text-white transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                onClick={() => navigate("/")}
              >
                <Home className="h-4 w-4" />
                Retour à l'accueil
              </Button>
              
              <Button 
                variant="outline" 
                className="border-black text-black hover:bg-black hover:text-white transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                onClick={() => navigate("/products")}
              >
                <ShoppingBag className="h-4 w-4" />
                Continuer le shopping
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
