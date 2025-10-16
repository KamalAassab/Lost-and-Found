import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { PlusCircle, Search, Edit, Trash2, ChevronLeft, ChevronRight, Package, Filter, Grid, List, Eye, MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminProductsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 10;
  const formDialogRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  // Set page title
  useEffect(() => {
    document.title = "Gestion des Produits | Admin";
  }, []);

  // Fetch products
  const { data: allProducts, isLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      return await apiRequest('DELETE', `/api/products/${productId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès.",
      });
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    },
    onError: (error: any) => {
      console.error("Product deletion error details:", error);
      toast({
        title: "Erreur",
        description: (error.details || error.message) ?? "Une erreur est survenue lors de la suppression du produit.",
        variant: "destructive",
      });
    }
  });

  // Filter and paginate products
  const productsList = (allProducts as any[]) || [];
  const categoriesList = (categories as any[]) || [];
  
  const filteredProducts = productsList
    ? productsList
        .filter((product: any) => {
          const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               product.description.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
          return matchesSearch && matchesCategory;
        })
        .sort((a: any, b: any) => {
          let aValue = a[sortField];
          let bValue = b[sortField];
          
          // Handle special cases
          if (sortField === "price" || sortField === "oldPrice") {
            aValue = parseFloat(aValue) || 0;
            bValue = parseFloat(bValue) || 0;
          } else if (sortField === "name") {
            aValue = aValue?.toLowerCase() || "";
            bValue = bValue?.toLowerCase() || "";
          }
          
          if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
          if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
          return 0;
        })
    : [];
    
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openNewProductModal = () => {
    setEditingProduct(null);
    setIsOpen(true);
    // Scroll to the form dialog after it opens
    setTimeout(() => {
      formDialogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const openEditProductModal = (product: any) => {
    setEditingProduct(product);
    setIsOpen(true);
  };

  const confirmDelete = (product: any) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteProduct = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === "asc" ? 
      <ArrowUp className="h-4 w-4 text-black" /> : 
      <ArrowDown className="h-4 w-4 text-black" />;
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Professional Header */}
        <div className="bg-black text-white p-8 rounded-2xl mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl shadow-lg">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">Gestion des Produits</h1>
                <p className="text-gray-300 text-sm">Gérez votre catalogue de produits</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-0 shadow-lg">
                {productsList.length} Produits
              </Badge>
              <Button 
                onClick={openNewProductModal} 
                className="bg-white text-black hover:bg-gray-100 hover:text-black shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Nouveau Produit
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <Card className="mb-8 shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-blue-600" />
              <span>Filtres et Recherche</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-12 h-10 text-sm border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                />
              </div>
              <Select
                value={categoryFilter}
                onValueChange={(value) => {
                  setCategoryFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full md:w-[200px] h-10 text-sm border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="hoodies">Hoodies</SelectItem>
                  <SelectItem value="tshirts">T-shirts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products table */}
        <div className="bg-white rounded-md shadow-sm">
          {isLoading ? (
            <div className="p-4">
              <div className="space-y-2">
                {[...Array(5)].map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-lg font-medium mb-2">Aucun produit trouvé</p>
              <p className="text-sm text-gray-500">
                Essayez d'ajuster vos filtres ou ajoutez un nouveau produit.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="w-12 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => handleSort("id")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>ID</span>
                          {getSortIcon("id")}
                        </div>
                      </TableHead>
                      <TableHead className="w-20">Image</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Nom</span>
                          {getSortIcon("name")}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => handleSort("category")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Catégorie</span>
                          {getSortIcon("category")}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => handleSort("price")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Prix</span>
                          {getSortIcon("price")}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => handleSort("inStock")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Stock</span>
                          {getSortIcon("inStock")}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.map((product: any) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.id}</TableCell>
                        <TableCell>
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="w-12 h-12 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>
                          <span className="capitalize">
                            {product.category === "hoodies" || product.category === "hoodie"
                              ? "Hoodie"
                              : product.category === "tshirts" || product.category === "tshirt"
                                ? "T-shirt"
                                : product.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{formatPrice(product.price)}</span>
                            {product.oldPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product.oldPrice)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.inStock ? 'En stock' : 'Épuisé'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditProductModal(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => confirmDelete(product)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <div className="text-sm text-gray-500">
                    Affichage de {Math.min(filteredProducts.length, (currentPage - 1) * itemsPerPage + 1)} à {Math.min(filteredProducts.length, currentPage * itemsPerPage)} sur {filteredProducts.length} produits
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        const pageDiff = Math.abs(page - currentPage);
                        return pageDiff <= 1 || page === 1 || page === totalPages;
                      })
                      .map((page, index, array) => {
                        // Show ellipsis
                        if (index > 0 && page > array[index - 1] + 1) {
                          return (
                            <span key={`ellipsis-${page}`} className="px-3 py-2">
                              ...
                            </span>
                          );
                        }
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="w-9"
                          >
                            {page}
                          </Button>
                        );
                      })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Product Form Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg" ref={formDialogRef}>
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Modifiez les informations du produit' : 'Remplissez les informations pour créer un nouveau produit'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            categories={categoriesList}
            onClose={() => setIsOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Le produit sera définitivement supprimé.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>Êtes-vous sûr de vouloir supprimer ce produit ?</p>
            {productToDelete && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="font-medium">{productToDelete.name}</p>
                <p className="text-sm text-gray-500">{formatPrice(productToDelete.price)}</p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
