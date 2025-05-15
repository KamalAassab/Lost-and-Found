import React from "react";
import { useQuery } from "@tanstack/react-query";
import CategoryCard from "@/components/CategoryCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryHighlight() {
  const { data: categories, isLoading, error } = useQuery({ 
    queryKey: ['/api/categories'],
  });

  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold font-montserrat uppercase mb-2 text-center">
            Nos Catégories
          </h2>
          <p className="text-neutral-700 text-center mb-12">
            Explorez notre collection de vêtements streetwear de qualité supérieure
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !categories) {
    return (
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold font-montserrat uppercase mb-2 text-center">
            Nos Catégories
          </h2>
          <p className="text-neutral-700 text-center mb-12">
            Explorez notre collection de vêtements streetwear de qualité supérieure
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CategoryCard
              title="Hoodies"
              description="À partir de 199 MAD"
              imageUrl="/hoodie.jpg"
              slug="hoodies"
            />
            <CategoryCard
              title="T-Shirts"
              description="À partir de 120 MAD"
              imageUrl="/tshirt.jpg"
              slug="tshirts"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold font-montserrat uppercase mb-2 text-center">
          Nos Catégories
        </h2>
        <p className="text-neutral-700 text-center mb-12">
          Explorez notre collection de vêtements streetwear de qualité supérieure
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(Array.isArray(categories) ? categories : []).map((category: any) => (
            <CategoryCard
              key={category.id}
              title={category.name}
              description={
                category.slug === "hoodies"
                  ? "À partir de 199 MAD"
                  : "À partir de 120 MAD"
              }
              imageUrl={
                category.backgroundImageUrl
                  ? category.backgroundImageUrl
                  : category.slug === "hoodies"
                    ? "/hoodie.jpg"
                    : "/tshirt.jpg"
              }
              slug={category.name.toLowerCase().replace(/\s|-/g, "") === "tshirts" ? "tshirts" : category.slug}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
