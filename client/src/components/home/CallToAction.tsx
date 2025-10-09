import React from "react";

export default function CallToAction() {
  return (
    <section className="py-10 md:py-10 relative">
      <div className="absolute inset-0 z-0">
        <img
          src={window.location.hostname === 'kamalaassab.github.io' ? '/bottom-banner.jpg' : '/bottom-banner.jpg'}
          alt="Urban street fashion"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <h2 className="text-2xl md:text-3xl font-bold font-montserrat uppercase mb-3 text-white">
          Notre Mission
        </h2>
        <p className="text-neutral-200 max-w-2xl mx-auto mb-6 text-base leading-relaxed">
          LOST & FOUND est votre destination privilégiée pour l'expression de votre style urbain authentique. 
          Nous nous engageons à vous offrir une sélection exclusive de vêtements streetwear de haute qualité, 
          alliant tendances contemporaines et confort optimal. Notre mission est de vous permettre d'affirmer 
          votre identité unique à travers une mode accessible et durable.
        </p>
      </div>
    </section>
  );
}
