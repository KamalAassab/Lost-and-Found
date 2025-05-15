import React from "react";
import MainLayout from "@/layouts/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import PromotionBanner from "@/components/home/PromotionBanner";
import CategoryHighlight from "@/components/home/CategoryHighlight";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CallToAction from "@/components/home/CallToAction";

export default function HomePage() {
  // Set page title
  React.useEffect(() => {
    document.title = "L&F Vision";
  }, []);
  
  return (
    <MainLayout>
      <HeroSection />
      <PromotionBanner />
      <CategoryHighlight />
      <FeaturedProducts />
      <CallToAction />
    </MainLayout>
  );
}
