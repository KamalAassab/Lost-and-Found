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
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestion des Catégories</h1>
          <Button onClick={openNewCategoryModal} className="bg-primary hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouvelle Catégorie
          </Button>
        </div>

        {/* Categories grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-40 w-full" />
            ))}
          </div>
        ) : categories?.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-lg font-medium mb-2">Aucune catégorie trouvée</p>
            <p className="text-sm text-gray-500 mb-4">
              Ajoutez des catégories pour organiser vos produits.
            </p>
            <Button onClick={openNewCategoryModal}>Ajouter une catégorie</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories?.map((category: any) => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>Slug: {category.slug}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    {category.description || "Aucune description."}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditCategoryModal(category)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => confirmDelete(category)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </CardFooter>
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
    </AdminLayout>
  );
}
