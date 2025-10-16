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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Tag, Image, Save, X, Upload } from "lucide-react";

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
    <div className="w-full max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Basic Information Card */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-black text-white px-4 py-3">
              <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                <Tag className="h-4 w-4" />
                <span>Informations de la catégorie</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Nom de la catégorie</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Hoodies" 
                        className="h-9 text-sm border-gray-300 focus:border-red-500 focus:ring-red-500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            
              <div className="grid grid-cols-[1fr,auto] gap-2">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Slug</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="hoodies" 
                          className="h-9 text-sm border-gray-300 focus:border-red-500 focus:ring-red-500" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-500">
                        Identifiant unique pour l'URL de la catégorie. Doit être unique.
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-6 h-9 px-3 text-xs border-gray-300 hover:border-red-500 hover:text-red-600"
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
                    <FormLabel className="text-sm font-medium text-gray-700">Description (optionnelle)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Description de la catégorie..."
                        rows={3}
                        className="text-sm border-gray-300 focus:border-red-500 focus:ring-red-500"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
          </CardContent>
        </Card>
        
          {/* Image Upload Card */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-black text-white px-4 py-3">
              <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                <Image className="h-4 w-4" />
                <span>Image de fond</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2">
                <FormLabel className="text-sm font-medium text-gray-700">Télécharger une image</FormLabel>
                <div className="flex items-center gap-3">
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
                    className="h-9 px-3 text-xs border-gray-300 hover:border-red-500 hover:text-red-600"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    {selectedFile ? "Changer l'image" : "Choisir une image"}
                  </Button>
                  {selectedFile && (
                    <span className="text-xs text-gray-600 truncate max-w-[180px]">{selectedFile.name}</span>
                  )}
                </div>
                <FormDescription className="text-xs text-gray-500">
                  Formats acceptés: JPG, PNG, GIF (max 5MB)
                </FormDescription>
                {imagePreview && (
                  <div className="mt-3 flex items-start gap-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-2">Aperçu de l'image</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 px-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                        onClick={() => {
                          setImagePreview(null);
                          setSelectedFile(null);
                        }}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                )}
                {category?.backgroundImageUrl && !imagePreview && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-600 mb-2">Image actuelle:</p>
                    <img 
                      src={category.backgroundImageUrl} 
                      alt="Aperçu actuel" 
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200" 
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Form Actions Card */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={categoryMutation.isPending}
                  className="h-9 px-4 text-sm border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={categoryMutation.isPending}
                  className="h-9 px-4 text-sm bg-red-600 hover:bg-red-700 text-white border-0"
                >
                  {categoryMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {category ? "Mise à jour..." : "Création..."}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {category ? "Mettre à jour" : "Créer"}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
