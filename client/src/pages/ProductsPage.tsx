import React, { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/layouts/MainLayout";
import ProductCard from "@/components/ProductCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search } from "lucide-react";

export default function ProductsPage() {
  const [, params] = useRoute("/products/:category");
  const category = params?.category;
  const [, navigate] = useLocation();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string>(category || "all");
  
  // Update filter when route changes
  useEffect(() => {
    if (category) {
      setFilter(category);
    }
  }, [category]);
  
  // Set page title
  useEffect(() => {
    document.title = filter === "all" 
      ? "Tous les produits | LOST & FOUND" 
      : `${filter === "hoodie" ? "Hoodies" : "T-shirts"} | LOST & FOUND`;
  }, [filter]);

  // Fetch products
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['/api/products', { category: filter !== "all" ? filter : undefined, search: searchTerm || undefined }],
  });

  const handleFilterChange = (value: string) => {
    setFilter(value);
    
    if (value === "all") {
      navigate("/products");
    } else {
      navigate(`/products/${value}`);
    }
  };

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
                : filter === "hoodie" ? "Hoodies" : "T-shirts"}
            </h1>
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <Tabs defaultValue={filter} value={filter} onValueChange={handleFilterChange} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="hoodie">Hoodies</TabsTrigger>
                <TabsTrigger value="tshirt">T-shirts</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Products grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white">
                  <Skeleton className="h-[300px] w-full" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">Erreur lors du chargement des produits. Veuillez réessayer.</p>
            </div>
          ) : products?.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-500">
                Essayez d'ajuster vos filtres ou votre recherche.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
