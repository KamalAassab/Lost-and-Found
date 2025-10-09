import React from "react";
import { useQuery } from "@tanstack/react-query";
import CategoryCard from "@/components/CategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { staticCategories } from "@/data/staticData";

export default function CategoryHighlight() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/categories'],
    enabled: window.location.hostname !== 'kamalaassab.github.io', // Disable for static deployment
  });

  // Use static data for GitHub Pages deployment
  const isStaticDeployment = window.location.hostname === 'kamalaassab.github.io';
  const categories = isStaticDeployment ? staticCategories : (Array.isArray(data) ? data : []);

  if (!isStaticDeployment && isLoading) {
    return (
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold font-montserrat uppercase mb-2 text-center">
            Nos Catégories
          </h2>
          <p className="text-neutral-700 text-center mb-10 text-sm">
            Explorez notre collection de vêtements streetwear de qualité supérieure
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      </section>
    );
  }

  if (!isStaticDeployment && error) {
    // Display default cards if there's an error fetching categories
    return (
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold font-montserrat uppercase mb-2 text-center">
            Nos Catégories
          </h2>
          <p className="text-neutral-700 text-center mb-10 text-sm">
            Explorez notre collection de vêtements streetwear de qualité supérieure
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CategoryCard
              title="Hoodies"
              description="À partir de 199 MAD"
              imageUrl={window.location.hostname === 'kamalaassab.github.io' ? '/hoodie.jpg' : '/hoodie.jpg'}
              slug="hoodies"
            />
            <CategoryCard
              title="T-Shirts"
              description="À partir de 120 MAD"
              imageUrl={window.location.hostname === 'kamalaassab.github.io' ? '/tshirt.jpg' : '/tshirt.jpg'}
              slug="tshirts"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 bg-white">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold font-montserrat uppercase mb-2 text-center">
          Nos Catégories
        </h2>
        <p className="text-neutral-700 text-center mb-10 text-sm">
          Explorez notre collection de vêtements streetwear de qualité supérieure
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category: any) => {
            console.log('Category object:', category);
            return (
              <CategoryCard
                key={category.slug}
                title={category.name}
                description={category.description}
                imageUrl={category.backgroundImageUrl || (window.location.hostname === 'kamalaassab.github.io' ? '/placeholder-category.jpg' : '/placeholder-category.jpg')}
                slug={category.slug}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
