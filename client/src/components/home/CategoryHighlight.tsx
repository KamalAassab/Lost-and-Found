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
              imageUrl="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&h=800"
              slug="hoodie"
            />
            <CategoryCard
              title="T-Shirts"
              description="À partir de 120 MAD"
              imageUrl="https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&h=800"
              slug="tshirt"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((category: any) => (
            <CategoryCard
              key={category.id}
              title={category.name}
              description={
                category.slug === "hoodies" 
                  ? "À partir de 199 MAD" 
                  : "À partir de 120 MAD"
              }
              imageUrl={
                category.slug === "hoodies"
                  ? "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&h=800"
                  : "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&h=800"
              }
              slug={category.slug}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
