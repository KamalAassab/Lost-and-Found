import React, { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useCart } from "@/context/CartContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2, CreditCard, Truck } from "lucide-react";

// Form schema
const checkoutSchema = z.object({
  customerName: z.string().min(3, "Le nom doit comporter au moins 3 caractères"),
  customerEmail: z.string().email("Veuillez fournir un e-mail valide"),
  customerPhone: z.string().min(8, "Le numéro de téléphone doit comporter au moins 8 caractères"),
  shippingAddress: z.string().min(5, "L'adresse doit comporter au moins 5 caractères"),
  city: z.string().min(2, "La ville doit comporter au moins 2 caractères"),
  postalCode: z.string().min(5, "Le code postal doit comporter au moins 5 caractères"),
  paymentMethod: z.enum(["cash_on_delivery", "credit_card"]),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutForm() {
  const [, navigate] = useLocation();
  const { cartItems, clearCart } = useCart();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<"cash_on_delivery" | "credit_card">("cash_on_delivery");

  // Create form
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      shippingAddress: "",
      city: "",
      postalCode: "",
      paymentMethod: "cash_on_delivery",
    },
  });

  // Submit order mutation
  const orderMutation = useMutation({
    mutationFn: async (data: CheckoutFormValues) => {
      const orderData = {
        ...data,
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          price: item.price,
          name: item.name,
          imageUrl: item.imageUrl,
          category: item.category,
        })),
      };
      
      return apiRequest('POST', '/api/orders', orderData);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      
      toast({
        title: "Commande passée avec succès",
        description: "Merci pour votre achat!",
      });
      
      // Navigate to success page
      navigate(`/success?order=${data.order.id}`);
    },
    onError: (error) => {
      console.error("Order error:", error);
      
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la commande. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutFormValues) => {
    // Update payment method from tabs
    data.paymentMethod = paymentMethod;
    
    // Submit order
    orderMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations de livraison</CardTitle>
        <CardDescription>
          Entrez vos informations pour la livraison et le paiement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informations personnelles</h3>
              
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="+212 XXXXXXXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Separator />
            
            {/* Shipping address */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Adresse de livraison</h3>
              
              <FormField
                control={form.control}
                name="shippingAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Rue de la Mode" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville</FormLabel>
                      <FormControl>
                        <Input placeholder="Casablanca" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code postal</FormLabel>
                      <FormControl>
                        <Input placeholder="20000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Separator />
            
            {/* Payment method */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Méthode de paiement</h3>
              
              <Tabs defaultValue="cash_on_delivery" value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="cash_on_delivery">Paiement à la livraison</TabsTrigger>
                  <TabsTrigger value="credit_card">Carte bancaire</TabsTrigger>
                </TabsList>
                
                <TabsContent value="cash_on_delivery" className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-md">
                    <Truck className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Paiement à la livraison</p>
                      <p className="text-sm text-gray-500">Payez en espèces lors de la réception</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="credit_card" className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-md mb-4">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Paiement par carte</p>
                      <p className="text-sm text-gray-500">Paiement sécurisé avec Visa ou Mastercard</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Numéro de carte</label>
                      <Input placeholder="1234 5678 9012 3456" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Date d'expiration</label>
                        <Input placeholder="MM/AA" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">CVC</label>
                        <Input placeholder="123" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nom sur la carte</label>
                      <Input placeholder="John Doe" />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={orderMutation.isPending}
            >
              {orderMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement en cours...
                </>
              ) : (
                'Confirmer la commande'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
