import React from "react";

export default function PromotionBanner() {
  return (
    <section className="bg-neutral-100 py-12 px-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="bg-primary text-white p-6">
          <h3 className="font-bebas text-2xl mb-2">3 HOODIES + 1 GRATUIT</h3>
          <p className="text-neutral-200 text-sm">Profitez de cette offre limitée</p>
        </div>
        <div className="bg-primary text-white p-6">
          <h3 className="font-bebas text-2xl mb-2">2 T-SHIRTS + 1 GRATUIT</h3>
          <p className="text-neutral-200 text-sm">Complétez votre garde-robe</p>
        </div>
        <div className="bg-accent text-white p-6">
          <h3 className="font-bebas text-2xl mb-2">LIVRAISON GRATUITE</h3>
          <p className="text-white text-sm">Pour toute commande supérieure à 500 MAD</p>
        </div>
      </div>
    </section>
  );
}
