import React from "react";

export default function PromotionBanner() {
  return (
    <section className="bg-neutral-100 py-10 px-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 text-center">
        <div className="bg-black/90 text-white p-6 rounded-xl shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
          <h3 className="font-bebas text-2xl mb-1 tracking-wide">3 HOODIES + 1 GRATUIT</h3>
          <p className="text-neutral-200 text-sm">Profitez de cette offre limitée</p>
        </div>
        <div className="bg-black/90 text-white p-6 rounded-xl shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
          <h3 className="font-bebas text-2xl mb-1 tracking-wide">2 T-SHIRTS + 1 GRATUIT</h3>
          <p className="text-neutral-200 text-sm">Complétez votre garde-robe</p>
        </div>
        <div className="bg-accent text-white p-6 rounded-xl shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
          <h3 className="font-bebas text-2xl mb-1 tracking-wide">LIVRAISON GRATUITE</h3>
          <p className="text-white text-sm">Pour toute commande supérieure à 500 MAD</p>
        </div>
      </div>
    </section>
  );
}
