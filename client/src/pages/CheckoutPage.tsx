import React, { useEffect } from "react";
import { useLocation } from "wouter";
import MainLayout from "@/layouts/MainLayout";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Truck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { cartItems, cartTotal, freeShipping } = useCart();

  // Redirect to home if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/");
    }
  }, [cartItems, navigate]);

  // Set page title
  useEffect(() => {
    document.title = "Paiement | LOST & FOUND";
  }, []);

  // Calculate shipping and total costs
  const shippingCost = freeShipping ? 0 : 50;
  const totalCost = cartTotal + shippingCost;

  if (cartItems.length === 0) {
    return null; // Don't render anything while redirecting
  }

  return (
    <MainLayout>
      <div className="bg-neutral-100 py-12">
        <div className="container mx-auto">
          <div className="flex items-center mb-8">
            <button 
              onClick={() => navigate("/")}
              className="mr-3 p-2 hover:bg-neutral-200 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-3xl font-bold">Paiement</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout form */}
            <div className="lg:col-span-2">
              <CheckoutForm />
            </div>

            {/* Order summary */}
            <div>
              <div className="bg-white p-6 rounded-lg shadow-sm sticky top-6">
                <h2 className="text-xl font-bold mb-4">Récapitulatif de commande</h2>
                
                {/* Cart items */}
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={`${item.productId}-${item.size}`} className="flex items-center justify-between gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                        style={{ minWidth: 64, minHeight: 64 }}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          Taille: {item.size} | Qté: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        {item.isFree ? (
                          <p className="text-accent font-medium">GRATUIT</p>
                        ) : (
                          <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                {/* Subtotal */}
                <div className="flex justify-between mb-2">
                  <span>Sous-total</span>
                  <span className="font-medium">{formatPrice(cartTotal)}</span>
                </div>
                
                {/* Shipping */}
                <div className="flex justify-between mb-2">
                  <span>Livraison</span>
                  {freeShipping ? (
                    <span className="text-accent font-medium">GRATUITE</span>
                  ) : (
                    <span className="font-medium">{formatPrice(shippingCost)}</span>
                  )}
                </div>
                
                {/* Delivery estimation */}
                <div className="flex items-start gap-2 mt-2 text-sm text-gray-600">
                  <Truck className="h-4 w-4 text-accent mt-1" />
                  <div>
                    <span className="font-semibold">Délais de Livraison</span>
                    <ul className="list-disc ml-5 mt-1">
                      <li>Settat : 1-2 jours ouvrables</li>
                      <li>Grandes villes : 2-3 jours ouvrables</li>
                      <li>Autres régions : 3-5 jours ouvrables</li>
                    </ul>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                {/* Total */}
                <div className="flex justify-between mb-4">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-xl">{formatPrice(totalCost)}</span>
                </div>
                
                {/* Promotions applied */}
                {cartItems.some(item => item.isFree) && (
                  <div className="bg-green-50 text-green-800 p-3 text-sm rounded mt-4">
                    <p className="font-medium">✓ Promotions appliquées</p>
                    <p className="text-xs mt-1">
                      {cartItems.filter(item => item.isFree && item.category === 'hoodie').length > 0 && 
                        "- 3 Hoodies + 1 gratuit"}
                      {cartItems.filter(item => item.isFree && item.category === 'tshirt').length > 0 && 
                        "\n- 2 T-shirts + 1 gratuit"}
                    </p>
                  </div>
                )}
                
                {/* Free shipping note */}
                {freeShipping && (
                  <div className="bg-accent bg-opacity-100 p-3 rounded mt-2">
                    <p className="font-bold text-white">✓ Livraison gratuite</p>
                    <p className="font-bold text-white text-xs mt-1">
                      Pour toute commande supérieure à 500 MAD
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
