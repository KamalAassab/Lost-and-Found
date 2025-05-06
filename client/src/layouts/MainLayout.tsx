import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartSlideout from "@/components/CartSlideout";
import { useMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const isMobile = useMobile();

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header toggleCart={toggleCart} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <CartSlideout isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
