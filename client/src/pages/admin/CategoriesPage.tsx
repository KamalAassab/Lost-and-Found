import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/layouts/AdminLayout";
import CategoryForm from "@/components/admin/CategoryForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { PlusCircle, Edit, Trash2, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";

export default function CategoriesPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null);
  
  const { toast } = useToast();

  // Set page title
  useEffect(() => {
    document.title = "Gestion des Catégories | Admin";
  }, []);

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  const categoriesList = (categories as any[]) || [];

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      return await apiRequest('DELETE', `/api/categories/${categoryId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Catégorie supprimée",
        description: "La catégorie a été supprimée avec succès.",
      });
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    },
    onError: (error) => {
      console.error("Error deleting category:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression. Vérifiez que la catégorie n'est pas utilisée par des produits.",
        variant: "destructive",
      });
    }
  });

  const openNewCategoryModal = () => {
    setEditingCategory(null);
    setIsOpen(true);
  };

  const openEditCategoryModal = (category: any) => {
    setEditingCategory(category);
    setIsOpen(true);
  };

  const confirmDelete = (category: any) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete.id);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Professional Header */}
        <div className="bg-black text-white p-8 rounded-2xl mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl shadow-lg">
                <Tag className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">Gestion des Catégories</h1>
                <p className="text-gray-300 text-sm">Gérez votre catalogue de catégories</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-0 shadow-lg">
                {categoriesList.length} Catégories
              </Badge>
              <Button 
                onClick={openNewCategoryModal} 
                className="bg-white text-black hover:bg-gray-100 hover:text-black shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Nouvelle Catégorie
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">

        {/* Categories grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-40 w-full" />
            ))}
          </div>
        ) : categoriesList?.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-lg font-medium mb-2">Aucune catégorie trouvée</p>
            <p className="text-sm text-gray-500 mb-4">
              Ajoutez des catégories pour organiser vos produits.
            </p>
            <Button onClick={openNewCategoryModal}>Ajouter une catégorie</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoriesList?.map((category: any) => (
              <Card key={category.id} className="group relative overflow-hidden bg-white border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-gray-300">
                {/* Professional Background Image Section */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {category.backgroundImageUrl ? (
                    <>
                      <img 
                        src={category.backgroundImageUrl} 
                        alt={category.name}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                      />
                      {/* Professional Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 group-hover:via-black/30 transition-all duration-500"></div>
                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <Tag className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                      <Tag className="h-5 w-5 text-gray-700" />
                    </div>
                  </div>
                  
                  {/* Category Name Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white drop-shadow-lg group-hover:text-white transition-all duration-300">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-200 group-hover:text-gray-100 transition-all duration-300">
                      {category.slug}
                    </p>
                  </div>
                </div>
                
                {/* Professional Content Section */}
                <div className="p-6 space-y-4">
                  {/* Description */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {category.description || "Aucune description disponible."}
                    </p>
                  </div>
                  
                  {/* Stats or Info */}
                  <div className="flex items-center justify-between py-2 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Active</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      ID: {category.id}
                    </div>
                  </div>
                </div>
                
                {/* Professional Action Buttons */}
                <div className="px-6 pb-6">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditCategoryModal(category)}
                      className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 transition-all duration-300 hover:scale-105 hover:shadow-md"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700 transition-all duration-300 hover:scale-105 hover:shadow-md"
                      onClick={() => confirmDelete(category)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                </div>
                
                {/* Hover Border Effect */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-red-500/20 rounded-lg transition-all duration-500 pointer-events-none"></div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Category Form Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            category={editingCategory}
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
              Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {categoryToDelete && (
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="font-medium">{categoryToDelete.name}</p>
                <p className="text-sm text-gray-500">{categoryToDelete.slug}</p>
              </div>
            )}
            <p className="mt-4 text-sm text-amber-600">
              <strong>Attention:</strong> La suppression échouera si la catégorie est utilisée par des produits.
            </p>
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
              onClick={handleDeleteCategory}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}
