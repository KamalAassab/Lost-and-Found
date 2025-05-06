import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Search, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShopLogo } from "@/components/ui/shop-logo";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

interface HeaderProps {
  toggleCart: () => void;
}

export default function Header({ toggleCart }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const [location] = useLocation();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const isActive = (path: string) => {
    return location === path 
      || (path !== '/' && location.startsWith(path));
  };

  return (
    <header className="bg-primary text-white">
      {/* Top promo banner */}
      <div className="bg-accent text-white py-2 text-center font-bebas tracking-wider text-sm md:text-base">
        <p>LIVRAISON GRATUITE POUR LES COMMANDES DE PLUS DE 500 MAD</p>
      </div>

      {/* Navigation bar */}
      <nav className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="text-2xl md:text-3xl font-bold font-montserrat tracking-wider">
            <ShopLogo />
          </a>
        </Link>

        {/* Menu */}
        <div className="hidden md:flex space-x-8 text-sm font-medium">
          <Link href="/">
            <a className={cn(
              "hover:text-neutral-200 transition duration-300", 
              isActive('/') && "text-neutral-200 font-bold"
            )}>
              ACCUEIL
            </a>
          </Link>
          <Link href="/products/hoodie">
            <a className={cn(
              "hover:text-neutral-200 transition duration-300",
              isActive('/products/hoodie') && "text-neutral-200 font-bold"
            )}>
              HOODIES
            </a>
          </Link>
          <Link href="/products/tshirt">
            <a className={cn(
              "hover:text-neutral-200 transition duration-300",
              isActive('/products/tshirt') && "text-neutral-200 font-bold"
            )}>
              T-SHIRTS
            </a>
          </Link>
          <Link href="/products">
            <a className={cn(
              "hover:text-neutral-200 transition duration-300",
              isActive('/products') && !isActive('/products/hoodie') && !isActive('/products/tshirt') && "text-neutral-200 font-bold"
            )}>
              PROMOTIONS
            </a>
          </Link>
        </div>

        {/* Right icons */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:text-neutral-200 transition duration-300 text-white"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:text-neutral-200 transition duration-300 text-white"
          >
            <User className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-neutral-200 transition duration-300 text-white relative"
            onClick={toggleCart}
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-accent hover:bg-accent text-white text-xs w-5 h-5 flex items-center justify-center p-0 rounded-full">
                {totalItems}
              </Badge>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:text-neutral-200 transition duration-300 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu (hidden by default) */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-2 pb-4 bg-primary border-t border-gray-800">
          <Link href="/">
            <a className="block py-2 border-b border-neutral-700">ACCUEIL</a>
          </Link>
          <Link href="/products/hoodie">
            <a className="block py-2 border-b border-neutral-700">HOODIES</a>
          </Link>
          <Link href="/products/tshirt">
            <a className="block py-2 border-b border-neutral-700">T-SHIRTS</a>
          </Link>
          <Link href="/products">
            <a className="block py-2">PROMOTIONS</a>
          </Link>
        </div>
      )}
    </header>
  );
}
