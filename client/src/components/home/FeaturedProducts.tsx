import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState<"all" | "hoodie" | "tshirt">("all");

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['/api/products', { featured: true }],
  });

  const filteredProducts = products
    ? activeTab === "all"
      ? products
      : products.filter((product: any) => product.category === activeTab)
    : [];

  return (
    <section className="py-16 px-4 bg-neutral-100">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold font-montserrat uppercase mb-2 text-center">
          Produits Populaires
        </h2>
        <p className="text-neutral-700 text-center mb-8">
          Découvrez nos articles les plus vendus cette saison
        </p>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <button
            className={`px-6 py-2 font-semibold border-b-2 mx-2 text-sm transition-all ${
              activeTab === "all" ? "border-primary" : "border-transparent hover:border-primary"
            }`}
            onClick={() => setActiveTab("all")}
          >
            TOUS
          </button>
          <button
            className={`px-6 py-2 font-semibold border-b-2 mx-2 text-sm transition-all ${
              activeTab === "hoodie" ? "border-primary" : "border-transparent hover:border-primary"
            }`}
            onClick={() => setActiveTab("hoodie")}
          >
            HOODIES
          </button>
          <button
            className={`px-6 py-2 font-semibold border-b-2 mx-2 text-sm transition-all ${
              activeTab === "tshirt" ? "border-primary" : "border-transparent hover:border-primary"
            }`}
            onClick={() => setActiveTab("tshirt")}
          >
            T-SHIRTS
          </button>
        </div>

        {/* Products */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white">
                <Skeleton className="h-[300px] w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Erreur lors du chargement des produits. Veuillez réessayer.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.slice(0, 4).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/products">
            <a className="inline-block border-2 border-primary bg-transparent text-primary px-8 py-3 font-bold uppercase text-sm tracking-wider hover:bg-primary hover:text-white transition duration-300">
              Voir tous les produits
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
}
