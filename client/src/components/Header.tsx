import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Search, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShopLogo } from "@/components/ui/shop-logo";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";
import { staticProducts } from "@/data/staticData";

interface HeaderProps {
  toggleCart: () => void;
}

export default function Header({ toggleCart }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { cartItems } = useCart();
  const [location] = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  // Fetch all products for search
  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
    enabled: window.location.hostname !== 'kamalaassab.github.io', // Disable for static deployment
  });

  // Use static data for GitHub Pages deployment
  const isStaticDeployment = window.location.hostname === 'kamalaassab.github.io';
  const displayProducts = isStaticDeployment ? staticProducts : products;

  // Filter products by search query
  const searchResults = searchQuery.trim()
    ? displayProducts.filter((product: any) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Close search on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isSearchOpen &&
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchOpen]);

  // Close search on ESC
  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    }
    if (isSearchOpen) {
      document.addEventListener("keydown", handleEsc);
    } else {
      document.removeEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isSearchOpen]);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Scroll event to shrink navbar and hide promo
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalOrders = cartItems.length;

  const isActive = (path: string) => {
    return location === path 
      || (path !== '/' && location.startsWith(path));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-neutral-800 shadow-sm transition-all duration-300">
      {/* Top promo banner */}
      <div className={cn("bg-accent text-white py-1 text-center font-bebas tracking-wider text-xs md:text-sm transition-all duration-300", scrolled && "hidden")}> 
        <p>LIVRAISON GRATUITE POUR LES COMMANDES DE PLUS DE 500 MAD</p>
      </div>

      {/* Navigation bar */}
      <nav className={cn("container mx-auto px-4 flex flex-wrap items-center justify-between relative transition-all duration-300", scrolled ? "py-2" : "py-4")}>
        {/* Logo */}
        <Link href="/" className="text-2xl md:text-3xl font-bold font-montserrat tracking-wider ml-2 text-white">
          <ShopLogo className={cn("transition-all duration-300", scrolled ? "h-8" : "h-12")} />
        </Link>

        {/* Menu */}
        <div className="hidden md:flex space-x-8 text-base font-semibold">
          <Link href="/" className={cn(
            "relative group transition-all duration-300 hover:text-neutral-300 text-white px-2 py-1",
            isActive('/') && "text-accent"
          )}>
            ACCUEIL
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/products" className={cn(
            "relative group transition-all duration-300 hover:text-neutral-300 text-white px-2 py-1",
            isActive('/products') && !isActive('/products/hoodie') && !isActive('/products/tshirt') && "text-accent"
          )}>
            CATALOGUE
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/products/hoodies" className={cn(
            "relative group transition-all duration-300 hover:text-neutral-300 text-white px-2 py-1",
            isActive('/products/hoodies') && "text-accent"
          )}>
            HOODIES
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/products/tshirts" className={cn(
            "relative group transition-all duration-300 hover:text-neutral-300 text-white px-2 py-1",
            isActive('/products/tshirts') && "text-accent"
          )}>
            T-SHIRTS
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </div>

        {/* Right icons */}
        <div className="flex items-center space-x-4" ref={searchBoxRef}>
          {/* Animated Search Icon/Input */}
          <div className="relative">
            {!isSearchOpen ? (
              <Button
                variant="ghost"
                size="icon"
                className="transition duration-300 text-white hover:bg-accent hover:text-white focus:bg-accent focus:text-white"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Ouvrir la recherche"
              >
                <Search className="h-5 w-5 transition-all duration-300" />
              </Button>
            ) : (
              <Input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-48 md:w-64 transition-all duration-300 bg-black border-white/20 text-white placeholder:text-white/50 focus:bg-neutral-900 px-4 py-2 rounded-full outline-none"
                style={{ minWidth: 120 }}
              />
            )}
            {/* Dropdown results */}
            {isSearchOpen && searchQuery && searchResults.length > 0 && (
              <div className="absolute left-0 mt-2 w-72 max-h-80 overflow-y-auto bg-white text-black rounded-lg shadow-lg z-50">
                {searchResults.slice(0, 6).map((product: any) => (
                  <Link
                    href={`/product/${product.slug}`}
                    key={product.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="block px-4 py-3 hover:bg-neutral-100 border-b last:border-b-0 border-neutral-200 transition"
                  >
                    <div className="flex items-center gap-3">
                      <img src={window.location.hostname === 'kamalaassab.github.io' ? `./${product.image}` : `/uploads/${product.image}`} alt={product.name} className="w-12 h-12 object-cover rounded" />
                      <div>
                        <div className="font-semibold">{product.name}</div>
                        <div className="text-xs text-neutral-500 line-clamp-1">{product.description}</div>
                      </div>
                    </div>
                  </Link>
                ))}
                {searchResults.length > 6 && (
                  <Link
                    href={`/products?search=${encodeURIComponent(searchQuery)}`}
                    className="block px-4 py-2 text-center text-primary hover:underline"
                  >
                    Voir plus de résultats
                  </Link>
                )}
              </div>
            )}
          </div>
          <Link href="/login">
            <Button 
              variant="ghost" 
              size="icon" 
              className="transition duration-300 text-white hover:bg-accent hover:text-white focus:bg-accent focus:text-white"
            >
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon"
              className="transition duration-300 text-white hover:bg-accent hover:text-white focus:bg-accent focus:text-white relative"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalOrders > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-accent hover:bg-accent text-white text-xs w-5 h-5 flex items-center justify-center p-0 rounded-full">
                  {totalOrders}
                </Badge>
              )}
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden transition duration-300 text-white hover:bg-accent hover:text-white focus:bg-accent focus:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu (hidden by default) */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-2 pb-4 bg-black border-t border-neutral-800">
          <Link href="/" className="block py-2 border-b border-neutral-700 text-white">
            ACCUEIL
          </Link>
          <Link href="/products" className="block py-2 border-b border-neutral-700 text-white">
            CATALOGUE
          </Link>
          <Link href="/products/hoodies" className="block py-2 border-b border-neutral-700 text-white">
            HOODIES
          </Link>
          <Link href="/products/tshirts" className="block py-2 border-b border-neutral-700 text-white">
            T-SHIRTS
          </Link>
        </div>
      )}
    </header>
  );
}
