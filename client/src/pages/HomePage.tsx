import React, { useRef } from "react";
import MainLayout from "@/layouts/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import CategoryHighlight from "@/components/home/CategoryHighlight";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CallToAction from "@/components/home/CallToAction";
import DebugStaticData from "@/debug-static-data";

export default function HomePage() {
  // Set page title
  React.useEffect(() => {
    document.title = "L&F Vision";
  }, []);

  const featuredProductsRef = useRef<HTMLDivElement>(null);

  const scrollToFeaturedProducts = () => {
    featuredProductsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <MainLayout>
      <DebugStaticData />
      <HeroSection onBuyNowClick={scrollToFeaturedProducts} />
      <CategoryHighlight />
      <div ref={featuredProductsRef}>
        <FeaturedProducts />
      </div>
      <CallToAction />
    </MainLayout>
  );
}
