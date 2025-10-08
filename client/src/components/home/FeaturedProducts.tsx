import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState<"all" | "hoodies" | "tshirts">("all");
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['/api/products', { featured: true }],
    enabled: window.location.hostname !== 'kamalaassab.github.io', // Disable for static deployment
  });

  const filteredProducts = Array.isArray(products)
    ? activeTab === "all"
      ? products
      : products.filter((product: any) => {
          const productCategory = product.category?.toLowerCase();
          return productCategory === activeTab;
        })
    : [];

  React.useEffect(() => {
    const checkScroll = () => {
      const el = scrollRef.current;
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [filteredProducts]);

  const scrollBy = (amount: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

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
        <div className="flex justify-center mb-10">
          <div className="bg-neutral-100 p-1 rounded-full inline-flex">
          <button
              className={`px-4 py-2 font-medium text-xs rounded-full transition-all duration-300 ${
                activeTab === "all" 
                  ? "bg-black text-white shadow" 
                  : "text-neutral-600 hover:text-black"
            }`}
            onClick={() => setActiveTab("all")}
          >
            TOUS
          </button>
          <button
              className={`px-4 py-2 font-medium text-xs rounded-full transition-all duration-300 ${
                activeTab === "hoodies" 
                  ? "bg-black text-white shadow" 
                  : "text-neutral-600 hover:text-black"
            }`}
            onClick={() => setActiveTab("hoodies")}
          >
            HOODIES
          </button>
          <button
              className={`px-4 py-2 font-medium text-xs rounded-full transition-all duration-300 ${
                activeTab === "tshirts" 
                  ? "bg-black text-white shadow" 
                  : "text-neutral-600 hover:text-black"
            }`}
            onClick={() => setActiveTab("tshirts")}
          >
            T-SHIRTS
          </button>
          </div>
        </div>

        {/* Products Horizontal Scroll */}
        <div className="relative">
          {canScrollLeft && (
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black hover:bg-black/90 text-white rounded-full p-1.5 shadow-lg"
              style={{ transform: 'translateY(-50%) translateX(-50%)' }}
              onClick={() => scrollBy(-300)}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {canScrollRight && (
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black hover:bg-black/90 text-white rounded-full p-1.5 shadow-lg"
              style={{ transform: 'translateY(-50%) translateX(50%)' }}
              onClick={() => scrollBy(300)}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        {isLoading ? (
            <div ref={scrollRef} className="flex overflow-x-auto gap-4 md:gap-6 xl:gap-8 pb-4 scroll-smooth">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex-none w-[170px] md:w-[180px] xl:w-[200px] bg-white rounded-xl overflow-hidden shadow">
                  <Skeleton className="h-[120px] md:h-[140px] xl:h-[150px] w-full" />
                  <div className="p-3 md:p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
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
            <div ref={scrollRef} className="flex overflow-x-auto gap-4 md:gap-6 xl:gap-8 pb-4 scroll-smooth">
              {filteredProducts.map((product: any) => (
                <div key={product.id} className="flex-none w-[170px] md:w-[180px] xl:w-[200px]">
                  <ProductCard product={product} compact />
                </div>
            ))}
          </div>
        )}
        </div>

        <div className="text-center mt-10">
          <Link href="/products">
            <Button 
              className="bg-black hover:bg-black/90 text-white px-6 py-3 text-xs md:text-sm font-medium rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Voir tous les produits
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
