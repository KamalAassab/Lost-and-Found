import React from "react";

export default function PromotionBanner() {
  return (
    <section className="bg-neutral-100 py-12 px-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="bg-black/90 text-white p-8 rounded-2xl shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
          <h3 className="font-bebas text-3xl mb-2 tracking-wide">3 HOODIES + 1 GRATUIT</h3>
          <p className="text-neutral-200 text-base">Profitez de cette offre limitée</p>
        </div>
        <div className="bg-black/90 text-white p-8 rounded-2xl shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
          <h3 className="font-bebas text-3xl mb-2 tracking-wide">2 T-SHIRTS + 1 GRATUIT</h3>
          <p className="text-neutral-200 text-base">Complétez votre garde-robe</p>
        </div>
        <div className="bg-accent text-white p-8 rounded-2xl shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
          <h3 className="font-bebas text-3xl mb-2 tracking-wide">LIVRAISON GRATUITE</h3>
          <p className="text-white text-base">Pour toute commande supérieure à 500 MAD</p>
        </div>
      </div>
    </section>
  );
}
