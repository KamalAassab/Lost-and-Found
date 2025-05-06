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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

// Form schema
const productSchema = z.object({
  name: z.string().min(3, "Le nom doit comporter au moins 3 caractères"),
  slug: z.string().min(3, "Le slug doit comporter au moins 3 caractères"),
  description: z.string().min(10, "La description doit comporter au moins 10 caractères"),
  imageUrl: z.string().url("Veuillez entrer une URL valide"),
  price: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Le prix doit être un nombre positif"
  }),
  oldPrice: z.string().refine(val => val === "" || (!isNaN(parseFloat(val)) && parseFloat(val) > 0), {
    message: "L'ancien prix doit être un nombre positif ou être vide"
  }).optional(),
  category: z.enum(["hoodie", "tshirt"]),
  categoryId: z.string(),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  sizes: z.array(z.string()).min(1, "Sélectionnez au moins une taille"),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: any;
  categories: any[];
  onClose: () => void;
}

export default function ProductForm({ product, categories, onClose }: ProductFormProps) {
  const { toast } = useToast();
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);
  
  // Available sizes
  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"];
  
  // Prepare default values
  const defaultValues: Partial<ProductFormValues> = product
    ? {
        ...product,
        price: product.price.toString(),
        oldPrice: product.oldPrice?.toString() || "",
        categoryId: product.categoryId.toString(),
        sizes: Array.isArray(product.sizes) ? product.sizes : [],
      }
    : {
        name: "",
        slug: "",
        description: "",
        imageUrl: "",
        price: "",
        oldPrice: "",
        category: "hoodie",
        categoryId: categories?.[0]?.id.toString() || "",
        inStock: true,
        featured: false,
        sizes: ["S", "M", "L", "XL"],
      };

  // Create form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
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

  // Create/Update product mutation
  const productMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      // Convert string values to appropriate types
      const formattedData = {
        ...data,
        price: parseFloat(data.price),
        oldPrice: data.oldPrice ? parseFloat(data.oldPrice) : null,
        categoryId: parseInt(data.categoryId),
      };
      
      if (product) {
        // Update existing product
        return apiRequest('PUT', `/api/products/${product.id}`, formattedData);
      } else {
        // Create new product
        return apiRequest('POST', '/api/products', formattedData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      toast({
        title: product ? "Produit mis à jour" : "Produit créé",
        description: product 
          ? "Le produit a été mis à jour avec succès."
          : "Le nouveau produit a été créé avec succès.",
      });
      
      onClose();
    },
    onError: (error) => {
      console.error("Product mutation error:", error);
      
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    productMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du produit</FormLabel>
                <FormControl>
                  <Input placeholder="Urban Black Hoodie" {...field} />
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
                    <Input placeholder="urban-black-hoodie" {...field} />
                  </FormControl>
                  <FormDescription>
                    Identifiant unique pour l'URL du produit
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Hoodie streetwear premium avec un design urbain minimaliste."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL de l'image</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.jpg" {...field} />
                </FormControl>
                <FormDescription>
                  URL d'une image de produit haute qualité
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Pricing and category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix (MAD)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="oldPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ancien prix (MAD)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    placeholder="Optionnel" 
                    {...field} 
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  Laissez vide s'il n'y a pas de réduction
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    
                    // Find matching category ID
                    const selectedCategory = categories.find(c => c.slug === value || c.name.toLowerCase().includes(value));
                    if (selectedCategory) {
                      form.setValue("categoryId", selectedCategory.id.toString());
                    }
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="hoodie">Hoodie</SelectItem>
                    <SelectItem value="tshirt">T-shirt</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID de catégorie</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Product options */}
        <div className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <FormLabel>Tailles disponibles</FormLabel>
            <div className="flex flex-wrap gap-2 mt-1">
              <FormField
                control={form.control}
                name="sizes"
                render={() => (
                  <FormItem className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <FormField
                        key={size}
                        control={form.control}
                        name="sizes"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={size}
                              className="flex flex-row items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(size)}
                                  onCheckedChange={(checked) => {
                                    const updatedList = checked
                                      ? [...(field.value || []), size]
                                      : field.value?.filter(
                                          (s: string) => s !== size
                                        ) || [];
                                    field.onChange(updatedList);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                {size}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <FormField
              control={form.control}
              name="inStock"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal cursor-pointer">
                    En stock
                  </FormLabel>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal cursor-pointer">
                    Produit vedette
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Form actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={productMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={productMutation.isPending}
          >
            {productMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {product ? "Mise à jour..." : "Création..."}
              </>
            ) : (
              product ? "Mettre à jour" : "Créer"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
