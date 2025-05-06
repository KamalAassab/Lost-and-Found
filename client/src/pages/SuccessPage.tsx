import React, { useEffect } from "react";
import { useLocation } from "wouter";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function SuccessPage() {
  const [, navigate] = useLocation();
  const { clearCart } = useCart();
  const [orderNumber, setOrderNumber] = React.useState<string | null>(null);

  // Set page title
  useEffect(() => {
    document.title = "Commande Réussie | LOST & FOUND";
  }, []);

  // Get order number from URL params and clear cart
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderNum = params.get("order");
    setOrderNumber(orderNum);
    
    // Clear shopping cart
    clearCart();
  }, [clearCart]);

  return (
    <MainLayout>
      <div className="bg-neutral-100 py-20">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-white rounded-lg shadow-sm p-8 md:p-12 text-center">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Merci pour votre commande !
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Votre commande a été reçue et est en cours de traitement. Vous recevrez un email 
              de confirmation avec tous les détails.
            </p>
            
            {orderNumber && (
              <div className="bg-green-50 p-4 rounded-lg mb-8">
                <p className="text-green-800 font-medium">
                  Numéro de commande: <span className="font-bold">{orderNumber}</span>
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => navigate("/")}
              >
                Retour à l'accueil
              </Button>
              
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => navigate("/products")}
              >
                Continuer le shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
