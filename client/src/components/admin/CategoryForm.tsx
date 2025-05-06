import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { createSlug } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

// Form schema
const categorySchema = z.object({
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères"),
  slug: z.string().min(2, "Le slug doit comporter au moins 2 caractères"),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: any;
  onClose: () => void;
}

export default function CategoryForm({ category, onClose }: CategoryFormProps) {
  const { toast } = useToast();
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);
  
  // Prepare default values
  const defaultValues: Partial<CategoryFormValues> = category
    ? {
        ...category,
      }
    : {
        name: "",
        slug: "",
        description: "",
      };

  // Create form
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues,
  });
  
  // Watch name to generate slug
  const watchedName = form.watch("name");
  
  // Generate slug from name
  const generateSlug = () => {
    if (!watchedName) return;
    
    setIsGeneratingSlug(true);
    const slug = createSlug(watchedName);
    form.setValue("slug", slug);
    setIsGeneratingSlug(false);
  };

  // Create/Update category mutation
  const categoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      if (category) {
        // Update existing category
        return apiRequest('PUT', `/api/categories/${category.id}`, data);
      } else {
        // Create new category
        return apiRequest('POST', '/api/categories', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      
      toast({
        title: category ? "Catégorie mise à jour" : "Catégorie créée",
        description: category 
          ? "La catégorie a été mise à jour avec succès."
          : "La nouvelle catégorie a été créée avec succès.",
      });
      
      onClose();
    },
    onError: (error) => {
      console.error("Category mutation error:", error);
      
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CategoryFormValues) => {
    categoryMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de la catégorie</FormLabel>
              <FormControl>
                <Input placeholder="Hoodies" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-[1fr,auto] gap-2">
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="hoodies" {...field} />
                </FormControl>
                <FormDescription>
                  Identifiant unique pour l'URL de la catégorie
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="outline"
            className="mt-8"
            onClick={generateSlug}
            disabled={!watchedName || isGeneratingSlug}
          >
            Générer
          </Button>
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optionnelle)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Description de la catégorie..."
                  rows={3}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Form actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={categoryMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={categoryMutation.isPending}
          >
            {categoryMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {category ? "Mise à jour..." : "Création..."}
              </>
            ) : (
              category ? "Mettre à jour" : "Créer"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
