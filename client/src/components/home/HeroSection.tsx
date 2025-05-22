import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onBuyNowClick: () => void;
}

export default function HeroSection({ onBuyNowClick }: HeroSectionProps) {
  return (
    <section className="relative h-[70vh] bg-primary overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/banner.jpg"
          alt=""
          className="w-full h-full object-cover opacity-60"
        />
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center relative z-10 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white font-montserrat leading-tight uppercase mb-4">
          Style Urbain, Révélé
        </h1>
        <p className="text-neutral-200 text-lg md:text-xl mb-8 max-w-lg">
          L'essence de la rue rencontre l'inconnu. Découvrez une collection énigmatique de pièces streetwear haut de gamme, façonnée pour ceux qui devinent les tendances avant qu'elles n'émergent.
        </p>
        <Button 
          onClick={onBuyNowClick}
          className="bg-accent hover:bg-accent/90 text-white font-bold py-3 px-8 rounded-full text-lg uppercase tracking-wide shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Buy Now
        </Button>
      </div>
    </section>
  );
}
