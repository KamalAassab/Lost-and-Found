import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/layouts/AdminLayout";
import OrderTable from "@/components/admin/OrderTable";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = "Gestion des Commandes | Admin";
  }, []);

  // Fetch orders
  const { data: orders, isLoading, isError, error } = useQuery({
    queryKey: ['/api/orders'],
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ['/api/orders'] })
      .finally(() => {
        setTimeout(() => setIsRefreshing(false), 500);
      });
  };

  // Filter orders
  const filteredOrders = orders
    ? orders
        .filter((order: any) => {
          const matchesStatus = statusFilter === "all" || order.status === statusFilter;
          const matchesSearch = 
            searchTerm === "" || 
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toString().includes(searchTerm);
          return matchesStatus && matchesSearch;
        })
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestion des Commandes</h1>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher par nom, email ou numéro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="processing">En traitement</SelectItem>
              <SelectItem value="shipped">Expédiée</SelectItem>
              <SelectItem value="delivered">Livrée</SelectItem>
              <SelectItem value="cancelled">Annulée</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Orders table */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-red-500 font-medium mb-2">
              Erreur lors du chargement des commandes
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {(error as Error)?.message || "Veuillez réessayer plus tard."}
            </p>
            <Button onClick={handleRefresh}>Réessayer</Button>
          </div>
        ) : filteredOrders.length > 0 ? (
          <OrderTable orders={filteredOrders} />
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-lg font-medium mb-2">Aucune commande trouvée</p>
            <p className="text-sm text-gray-500">
              Essayez de modifier vos filtres ou d'actualiser la page.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
