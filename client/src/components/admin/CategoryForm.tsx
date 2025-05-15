import React, { useState, useEffect, useRef } from "react";
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
  const [imagePreview, setImagePreview] = useState<string | null>(category?.backgroundImageUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Prepare default values
  const defaultValues: Partial<CategoryFormValues> = category
    ? {
        ...category,
        description: category.description || "",
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
  
  // Reset form when switching between edit/create
  useEffect(() => {
    form.reset(defaultValues);
  }, [category]);
  
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
    mutationFn: async (data: any) => {
      try {
        let payload;
        if (selectedFile) {
          // If there's a new file, use FormData
          payload = new FormData();
          // Always include all fields for update
          payload.append("name", data.name);
          payload.append("slug", data.slug);
          payload.append("description", data.description || "");
          payload.append("backgroundImage", selectedFile);
          if (category?.backgroundImageUrl) {
            payload.append("backgroundImageUrl", category.backgroundImageUrl);
          }
        } else {
          // If no new file, include all fields
          payload = {
            name: data.name,
            slug: data.slug,
            description: data.description || "",
            backgroundImageUrl: category?.backgroundImageUrl || null
          };
        }
        
        if (category) {
          // Update existing category
          return await apiRequest('PUT', `/api/categories/${category.id}`, payload);
        } else {
          // Create new category - send all fields
          if (selectedFile) {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("slug", data.slug);
            formData.append("description", data.description || "");
            formData.append("backgroundImage", selectedFile);
            return await apiRequest('POST', '/api/categories', formData);
          } else {
            return await apiRequest('POST', '/api/categories', {
              name: data.name,
              slug: data.slug,
              description: data.description || "",
            });
          }
        }
      } catch (error: any) {
        console.error("Category mutation error:", error);
        if (error.response?.status === 409) {
          throw new Error("Une catégorie avec ce nom ou ce slug existe déjà.");
        }
        throw error;
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
    onError: (error: any) => {
      console.error("Category mutation error:", error);
      toast({
        title: "Erreur",
        description: error.details || error.message || "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CategoryFormValues) => {
    categoryMutation.mutate(data);
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
                  Identifiant unique pour l'URL de la catégorie. Doit être unique.
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
        
        {/* Background image upload */}
        <div>
          <FormLabel>Image de fond (optionnelle)</FormLabel>
          <div className="flex items-center gap-4 mt-2">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? "Changer l'image" : "Choisir une image"}
            </Button>
            {selectedFile && (
              <span className="text-sm text-gray-600 truncate max-w-[180px]">{selectedFile.name}</span>
            )}
          </div>
          {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="Aperçu" className="h-32 rounded shadow" />
            </div>
          )}
          {category?.backgroundImageUrl && !imagePreview && (
            <div className="mt-2">
              <img src={category.backgroundImageUrl} alt="Aperçu" className="h-32 rounded shadow" />
            </div>
          )}
        </div>
        
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
