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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, Package, DollarSign, Tag, Image, Settings, Save, X } from "lucide-react";

// Define the product schema type
type ProductSchemaType = {
  name: string;
  slug: string;
  description: string;
  price: string;
  oldPrice?: string;
  category: "hoodies" | "tshirts";
  categoryId: string;
  inStock: boolean;
  featured: boolean;
  sizes: string[];
  image: string;
};

// Form schema
const productSchema = z.object({
  name: z.string().min(3, "Le nom doit comporter au moins 3 caractères"),
  slug: z.string().min(3, "Le slug doit comporter au moins 3 caractères"),
  description: z.string().min(10, "La description doit comporter au moins 10 caractères"),
  price: z.string().refine(val => {
    const num = parseInt(val, 10);
    return !isNaN(num) && num > 0;
  }, {
    message: "Le prix doit être un nombre entier positif"
  }),
  oldPrice: z.string().optional(),
  category: z.enum(["hoodies", "tshirts"]),
  categoryId: z.string().min(1, "Veuillez sélectionner une catégorie"),
  inStock: z.boolean(),
  featured: z.boolean(),
  sizes: z.array(z.string()).optional(),
  image: z.string().min(1, "L'image est requise"),
}) as z.ZodType<ProductSchemaType>;

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: any;
  categories: any[];
  onClose: () => void; 
}

// Define the payload type for backend
interface ProductPayload {
  name: string;
  slug: string;
  description: string;
  price: number;
  oldPrice?: number;
  category: "hoodies" | "tshirts";
  categoryId: number;
  inStock: boolean;
  featured: boolean;
  sizes: string; // stringified array
  image: string;
}

export default function ProductForm({ product, categories, onClose }: ProductFormProps) {
  const { toast } = useToast();
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(product ? product.imageUrl : null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Available sizes
  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL"];
  
  // Prepare default values
  const defaultValues: Partial<ProductFormValues> = product
    ? {
        ...product,
        price: product.price.toString(),
        oldPrice: product.oldPrice?.toString() || "",
        categoryId: product.categoryId.toString(),
        sizes: Array.isArray(product.sizes)
          ? product.sizes
          : typeof product.sizes === 'string'
            ? JSON.parse(product.sizes)
            : [],
        image: product.image || "",
      }
    : {
        name: "",
        slug: "",
        description: "",
        price: "",
        oldPrice: "",
        category: "hoodies",
        categoryId: categories?.[0]?.id.toString() || "",
        inStock: true,
        featured: false,
        sizes: ["S", "M", "L", "XL"],
        image: "",
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

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue("image", file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form after successful submission
  const resetForm = () => {
    form.reset(defaultValues);
    setImagePreview(null);
    setSelectedFile(null);
  };

  // Create/Update product mutation
  const productMutation = useMutation({
    mutationFn: async (data: ProductPayload | FormData) => {
      try {
        let response;
        if (product) {
          // Update existing product (JSON)
          response = await apiRequest('PUT', `/api/products/${product.id}`, data);
          return response;
        } else {
          // Create new product (FormData)
          response = await fetch('/api/products', {
            method: 'POST',
            body: data as FormData,
            credentials: 'include',
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || "Erreur lors de la requête");
          }
          
          return await response.json();
        }
      } catch (error: any) {
        console.error("Product mutation error details:", {
          error,
          data: data instanceof FormData ? "FormData" : data,
          productId: product?.id,
          errorMessage: error.message,
          errorStack: error.stack
        });
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Mutation success");
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: product ? "Produit mis à jour" : "Produit créé",
        description: product 
          ? "Le produit a été mis à jour avec succès."
          : "Le nouveau produit a été créé avec succès.",
      });
      resetForm();
      onClose();
    },
    onError: (error: any) => {
      console.error("Product mutation error (onError):", {
        error,
        message: error.message,
        stack: error.stack,
        name: error.name,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    console.log("onSubmit called with data:", data);
    if (!data.categoryId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une catégorie",
        variant: "destructive",
      });
      return;
    }

    if (!product && (!data.sizes || data.sizes.length === 0)) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une taille pour un nouveau produit",
        variant: "destructive",
      });
      return;
    }

    if (!product && !selectedFile) {
      toast({
        title: "Erreur",
        description: "Veuillez télécharger une image du produit.",
        variant: "destructive",
      });
      return;
    }

    if (!product) {
      // CREATE: Use FormData for file upload
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('slug', data.slug);
      formData.append('description', data.description);
      formData.append('price', String(Number(data.price)));
      formData.append('oldPrice', data.oldPrice ? String(Number(data.oldPrice)) : '');
      formData.append('category', data.category);
      formData.append('categoryId', data.categoryId);
      formData.append('inStock', String(data.inStock));
      formData.append('featured', String(data.featured));
      formData.append('sizes', JSON.stringify(data.sizes || []));
      if (selectedFile) {
        formData.append('image', selectedFile);
      }
      console.log("About to mutate with FormData (create)");
      productMutation.mutate(formData);
      return;
    }

    // UPDATE: Use JSON payload
    const payload: ProductPayload = {
      ...data,
      categoryId: Number(data.categoryId),
      sizes: Array.isArray(data.sizes) ? JSON.stringify(data.sizes) : JSON.stringify([]),
      oldPrice: data.oldPrice ? Number(data.oldPrice) : undefined,
      price: Number(data.price),
      image: product.image,
    };
    console.log("About to mutate with payload (update):", payload);
    try {
      productMutation.mutate(payload);
      console.log("Mutation called");
    } catch (err) {
      console.error("Mutation error (caught in try/catch):", err);
      toast({
        title: "Erreur mutation",
        description: (typeof err === 'object' && err && 'message' in err) ? (err as any).message : "Erreur inconnue lors de la mutation.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => {
          console.log("form.handleSubmit called", data);
          onSubmit(data);
        })} className="space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Basic Information Card */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-black text-white px-4 py-3">
              <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                <Package className="h-4 w-4" />
                <span>Informations de base</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Nom du produit</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Urban Black Hoodie" 
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
                          placeholder="urban-black-hoodie" 
                          className="h-9 text-sm border-gray-300 focus:border-red-500 focus:ring-red-500" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-500">
                        Identifiant unique pour l'URL du produit
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
                    <FormLabel className="text-sm font-medium text-gray-700">Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Hoodie streetwear premium avec un design urbain minimaliste."
                        rows={3}
                        className="text-sm border-gray-300 focus:border-red-500 focus:ring-red-500"
                        {...field}
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
                <span>Image du produit</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2">
                <FormLabel className="text-sm font-medium text-gray-700">Télécharger une image</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer h-9 text-sm border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
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
                          form.setValue("image", "");
                        }}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Pricing and Category Card */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-black text-white px-4 py-3">
              <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                <DollarSign className="h-4 w-4" />
                <span>Prix et catégorie</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Prix (MAD)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="1" 
                          min="1" 
                          placeholder="199" 
                          className="h-9 text-sm border-gray-300 focus:border-red-500 focus:ring-red-500" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="oldPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Ancien prix (optionnel)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="1" 
                          min="1" 
                          placeholder="249" 
                          className="h-9 text-sm border-gray-300 focus:border-red-500 focus:ring-red-500" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Catégorie</FormLabel>
                      {categories.length === 0 ? (
                        <div className="text-xs text-gray-400">Aucune catégorie trouvée. Ajoutez-en une d'abord.</div>
                      ) : (
                        <Select
                          onValueChange={(value) => {
                            form.setValue("category", value as "hoodies" | "tshirts");
                            field.onChange(value as "hoodies" | "tshirts");
                            // Find matching category ID
                            const selectedCategory = categories.find(
                              c => c.slug === value || c.name.toLowerCase().replace(/\s|-/g, "") === value
                            );
                            if (selectedCategory) {
                              form.setValue("categoryId", selectedCategory.id.toString());
                            }
                          }}
                          defaultValue={field.value}
                          disabled={categories.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9 text-sm border-gray-300 focus:border-red-500 focus:ring-red-500">
                              <SelectValue placeholder={categories.length === 0 ? "Chargement..." : "Sélectionner une catégorie"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hoodies">Hoodies</SelectItem>
                            <SelectItem value="tshirts">T-shirts</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
          </div>
          </CardContent>
        </Card>
          
          {/* Size Selection Card */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-black text-white px-4 py-3">
              <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                <Tag className="h-4 w-4" />
                <span>Tailles disponibles</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <FormField
                    key={size}
                    control={form.control}
                    name="sizes"
                    render={({ field }) => {
                      const checked = field.value?.includes(size);
                      return (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <button
                              type="button"
                              className={`px-3 py-2 rounded-md border text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500
                                ${checked 
                                  ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' 
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-red-500 hover:text-red-600'
                                }`}
                              onClick={() => {
                                const currentSizes = Array.isArray(field.value) ? field.value : [];
                                const newSizes = checked
                                  ? currentSizes.filter((s) => s !== size)
                                  : [...currentSizes, size];
                                field.onChange(newSizes);
                              }}
                            >
                              {size}
                            </button>
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage className="text-xs" />
            </CardContent>
          </Card>
          
          {/* Product Options Card */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-black text-white px-4 py-3">
              <CardTitle className="flex items-center space-x-2 text-sm font-medium">
                <Settings className="h-4 w-4" />
                <span>Options du produit</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex space-x-6">
                <FormField
                  control={form.control}
                  name="inStock"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-gray-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-medium text-gray-700 cursor-pointer">
                        En stock
                      </FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-gray-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-medium text-gray-700 cursor-pointer">
                        Produit en vedette
                      </FormLabel>
                    </FormItem>
                  )}
                />
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
                  disabled={productMutation.isPending}
                  className="h-9 px-4 text-sm border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={productMutation.isPending}
                  className="h-9 px-4 text-sm bg-red-600 hover:bg-red-700 text-white border-0"
                >
                  {productMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {product ? "Mise à jour..." : "Création..."}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {product ? "Mettre à jour" : "Créer"}
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
