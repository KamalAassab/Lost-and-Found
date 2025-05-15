import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative h-[90vh] bg-primary overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/banner.jpg"
          alt=""
          className="w-full h-full object-cover opacity-60"
        />
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="container mx-auto px-4 h-full flex flex-col justify-center items-start relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-white font-montserrat leading-tight uppercase mb-4">
          Style Urbain, Révélé
        </h1>
        <p className="text-neutral-200 text-lg md:text-xl mb-8 max-w-lg">
          L'essence de la rue rencontre l'inconnu. Découvrez une collection énigmatique de pièces streetwear haut de gamme, façonnée pour ceux qui devinent les tendances avant qu'elles n'émergent.
        </p>
      </div>
    </section>
  );
}
