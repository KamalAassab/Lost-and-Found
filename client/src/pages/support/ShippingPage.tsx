import React from "react";
import SupportLayout from "@/components/support/SupportLayout";
import { Truck, Clock, MapPin, CreditCard } from "lucide-react";

export default function ShippingPage() {
  return (
    <SupportLayout title="Livraison">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-neutral-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 mr-3 text-primary" />
              <h3 className="text-lg font-semibold">Délais de Livraison</h3>
            </div>
            <ul className="space-y-3 text-neutral-600">
              <li>• Settat : 1-2 jours ouvrables</li>
              <li>• Autres régions : 3-5 jours ouvrables</li>
            </ul>
          </div>
        </div>

        <div className="bg-neutral-50 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <CreditCard className="h-6 w-6 mr-3 text-primary" />
            <h3 className="text-lg font-semibold">Frais de Livraison</h3>
          </div>
          <div className="space-y-4">
            <p className="text-neutral-600">
              • Livraison gratuite pour toute commande supérieure à 500 MAD
            </p>
            <p className="text-neutral-600">
              • Frais de livraison : 50 MAD
            </p>
          </div>
        </div>

        <div className="bg-accent/10 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Informations Importantes</h3>
          <ul className="space-y-3 text-neutral-600">
            <li>• Les délais de livraison commencent à compter de la confirmation de votre commande</li>
            <li>• Vous recevrez un email de confirmation avec le numéro de suivi</li>
            <li>• En cas de retard, notre service client vous contactera</li>
            <li>• Pour toute question concernant votre livraison, contactez-nous au +212 642 05 78 69</li>
          </ul>
        </div>
      </div>
    </SupportLayout>
  );
} 