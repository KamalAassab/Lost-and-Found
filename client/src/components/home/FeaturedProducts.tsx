import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

export default function FeaturedProducts() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['/api/products'],
    enabled: true,
  });

  const displayProducts = products;

  // Get 3 most expensive t-shirts and 3 most expensive hoodies
  const filteredProducts = Array.isArray(displayProducts)
    ? [
        ...displayProducts
          .filter((product: any) => product.category?.toLowerCase() === 'tshirts')
          .sort((a: any, b: any) => Number(b.price) - Number(a.price))
          .slice(0, 3),
        ...displayProducts
          .filter((product: any) => product.category?.toLowerCase() === 'hoodies')
          .sort((a: any, b: any) => Number(b.price) - Number(a.price))
          .slice(0, 3)
      ]
    : [];

  useEffect(() => {
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
    if (scrollRef.current && !isScrolling) {
      setIsScrolling(true);
      scrollRef.current.scrollBy({ 
        left: amount, 
        behavior: 'smooth' 
      });
      setTimeout(() => setIsScrolling(false), 500);
    }
  };

  return (
    <section className="relative py-8 px-4 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.02),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,0,0,0.01),transparent_50%)]"></div>
      
      <div className="container mx-auto relative z-10">
        {/* Header with enhanced styling */}
        <div className="text-center mb-6">
          <div className="inline-block">
            <h2 className="text-3xl md:text-4xl font-bold font-montserrat uppercase mb-3 bg-gradient-to-r from-black via-neutral-800 to-black bg-clip-text text-transparent">
              Produits Premium
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-transparent via-black to-transparent mx-auto mb-4"></div>
          </div>
          <p className="text-neutral-600 text-base leading-relaxed text-center px-4">
            Découvrez notre sélection premium des articles les plus exclusifs et haut de gamme
          </p>
        </div>


        {/* Enhanced slider container */}
        <div className="relative group">
          {/* Gradient overlays for professional look */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-neutral-50 to-transparent z-20 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-neutral-50 to-transparent z-20 pointer-events-none"></div>
          
          {/* Navigation buttons with enhanced styling */}
          {canScrollLeft && (
            <button
              onClick={() => scrollBy(-320)}
              disabled={isScrolling}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/95 backdrop-blur-sm hover:bg-black text-black hover:text-white rounded-full p-4 shadow-2xl border border-neutral-200/50 transition-all duration-300 hover:scale-110 hover:shadow-3xl group/btn"
            >
              <ChevronLeft className="h-5 w-5 transition-transform duration-300 group-hover/btn:-translate-x-0.5" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scrollBy(320)}
              disabled={isScrolling}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/95 backdrop-blur-sm hover:bg-black text-black hover:text-white rounded-full p-4 shadow-2xl border border-neutral-200/50 transition-all duration-300 hover:scale-110 hover:shadow-3xl group/btn"
            >
              <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
            </button>
          )}
          {/* Products slider */}
          {isLoading ? (
            <div ref={scrollRef} className="flex overflow-x-auto gap-6 md:gap-7 pb-6 scroll-smooth scrollbar-hide">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex-none w-[200px] md:w-[220px] xl:w-[240px]">
                  <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-200/50">
                    <Skeleton className="h-[180px] md:h-[200px] xl:h-[220px] w-full" />
                    <div className="p-4">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
                <p className="text-red-600 font-medium">Erreur lors du chargement des produits</p>
                <p className="text-red-500 text-sm mt-2">Veuillez réessayer plus tard</p>
              </div>
            </div>
          ) : (
            <div 
              ref={scrollRef} 
              className="flex overflow-x-auto gap-6 md:gap-7 pb-6 scroll-smooth scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredProducts.map((product: any, index: number) => (
                <div 
                  key={product.id} 
                  className="flex-none w-[200px] md:w-[220px] xl:w-[240px] transform transition-all duration-500 hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard product={product} compact />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced CTA button */}
        <div className="text-center mt-6">
          <Link href="/products">
            <Button 
              className="group relative bg-gradient-to-r from-black to-neutral-800 hover:from-neutral-800 hover:to-black text-white px-8 py-4 text-sm font-semibold rounded-full transition-all duration-500 hover:scale-105 hover:shadow-2xl border border-neutral-300/20"
            >
              <span className="flex items-center gap-2">
                Voir tous les produits
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
