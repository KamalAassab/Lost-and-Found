import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative h-[70vh] bg-primary overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1613244470042-32971a7d8ca5?auto=format&fit=crop&w=1600&h=900"
          alt="Streetwear collection showcase"
          className="w-full h-full object-cover opacity-60"
        />
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="container mx-auto px-4 h-full flex flex-col justify-center items-start relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-white font-montserrat leading-tight uppercase mb-4">
          La Collection<br />Urbaine
        </h1>
        <p className="text-neutral-200 text-lg md:text-xl mb-8 max-w-lg">
          Découvrez notre nouvelle collection de streetwear conçue pour ceux qui veulent se démarquer.
        </p>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <Link href="/products/hoodie">
            <a className="bg-white text-primary px-8 py-3 font-bold uppercase text-sm tracking-wider hover:bg-neutral-200 transition duration-300 text-center">
              Hoodies
            </a>
          </Link>
          <Link href="/products/tshirt">
            <a className="border border-white text-white px-8 py-3 font-bold uppercase text-sm tracking-wider hover:bg-white hover:text-primary transition duration-300 text-center">
              T-shirts
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
}
