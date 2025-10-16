import React, { useState, useEffect, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/layouts/MainLayout";
import ProductCard from "@/components/ProductCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search } from "lucide-react";
import debounce from "lodash/debounce";

type SortOption = "price_asc" | "price_desc" | "name_asc" | "name_desc";

export default function ProductsPage() {
  const [, params] = useRoute("/products/:category");
  const category = params?.category;
  const [, navigate] = useLocation();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("price_asc");
  
  
  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setDebouncedSearchTerm(term);
    }, 300),
    []
  );

  // Update search term and trigger debounced search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };
  
  // Update filter when route changes
  useEffect(() => {
    if (category) {
      setFilter(category);
    } else {
      setFilter("all");
    }
  }, [category]);
  
  // Set page title
  useEffect(() => {
    document.title = filter === "all" 
      ? "Tous les produits | LOST & FOUND" 
      : filter === "hoodies"
        ? "Hoodies | LOST & FOUND"
        : filter === "tshirts"
          ? "T-shirts | LOST & FOUND"
          : "Tous les produits | LOST & FOUND";
  }, [filter]);

  // Fetch all products
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['/api/products'],
    enabled: true,
  });

  const displayProducts = (products as any[]) || [];

  const handleFilterChange = (value: string) => {
    setFilter(value);
    
    if (value === "all") {
      navigate("/products");
    } else {
      navigate(`/products/${value}`);
    }
  };

  // Sort products
  const sortedProducts = React.useMemo(() => {
    if (!displayProducts) return [];
    
    // First filter products based on category
    let filteredProducts = displayProducts;
    if (filter !== "all") {
      filteredProducts = displayProducts.filter((product: any) => {
        const productCategory = product.category.toLowerCase();
        const filterCategory = filter.toLowerCase();
        // Handle both singular and plural forms
        return productCategory === filterCategory || 
               productCategory === filterCategory + 's' ||
               (filterCategory.endsWith('s') && productCategory === filterCategory.slice(0, -1));
      });
    }
    
    // Then filter by search term
    if (debouncedSearchTerm) {
      filteredProducts = filteredProducts.filter((product: any) => 
        product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }
    
    // Finally sort the filtered products
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return Number(a.price) - Number(b.price);
        case "price_desc":
          return Number(b.price) - Number(a.price);
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }, [displayProducts, sortBy, debouncedSearchTerm, filter]);

  return (
    <MainLayout>
      <div className="bg-neutral-100 py-12">
        <div className="container mx-auto">
          <div className="flex items-center mb-8">
            <button 
              onClick={() => navigate("/")}
              className="mr-3 p-2 hover:bg-neutral-200 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-3xl font-bold">
              {filter === "all" 
                ? "Tous les produits" 
                : filter === "hoodies"
                  ? "Hoodies"
                  : filter === "tshirts"
                    ? "T-shirts"
                    : "Tous les produits"}
            </h1>
          </div>

          {/* Filters and Sort */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-xl shadow px-4 py-4 border border-neutral-200">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <Tabs defaultValue={filter} value={filter} onValueChange={handleFilterChange} className="w-full md:w-auto">
              <TabsList className="flex gap-2 bg-neutral-100 rounded-full p-1">
                <TabsTrigger value="all" className="rounded-full px-5 py-2 text-sm font-semibold transition-colors data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-black">Tous</TabsTrigger>
                <TabsTrigger value="hoodies" className="rounded-full px-5 py-2 text-sm font-semibold transition-colors data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-black">Hoodies</TabsTrigger>
                <TabsTrigger value="tshirts" className="rounded-full px-5 py-2 text-sm font-semibold transition-colors data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-black">T-shirts</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher..."
                className="pl-10 rounded-full border border-neutral-300 focus:border-black focus:ring-2 focus:ring-black/20 transition text-base bg-neutral-50"
                value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-700">Trier par</span>
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-full md:w-[200px] rounded-full border border-neutral-300 focus:border-black focus:ring-2 focus:ring-black/20 transition text-base bg-neutral-50">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-neutral-200 bg-white shadow-lg">
                  <SelectItem value="price_asc">Prix : croissant</SelectItem>
                  <SelectItem value="price_desc">Prix : décroissant</SelectItem>
                  <SelectItem value="name_asc">Nom : A à Z</SelectItem>
                  <SelectItem value="name_desc">Nom : Z à A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-transparent">
                  <Skeleton className="h-[420px] w-full rounded-3xl" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-md">
              <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-500">
                Essayez d'ajuster vos filtres ou votre recherche.
              </p>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-md">
              <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-500">
                Essayez d'ajuster vos filtres ou votre recherche.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 bg-white rounded-2xl p-6 shadow">
              {sortedProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
