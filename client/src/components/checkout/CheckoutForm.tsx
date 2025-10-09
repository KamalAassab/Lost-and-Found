import React, { useState, useEffect } from "react";
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
import { useAuth } from "@/context/AuthContext";

// Form schema
const checkoutSchema = z.object({
  customerName: z.string().min(3, "Le nom doit comporter au moins 3 caractères"),
  customerEmail: z.string().email("Veuillez fournir un e-mail valide"),
  customerPhone: z.string().min(8, "Le numéro de téléphone doit comporter au moins 8 caractères"),
  shippingAddress: z.string().min(5, "L'adresse doit comporter au moins 5 caractères"),
  city: z.string().min(2, "La ville doit comporter au moins 2 caractères"),
  postalCode: z.string().min(5, "Le code postal doit comporter au moins 5 caractères"),
  paymentMethod: z.enum(["cash_on_delivery", "credit_card"]),
  cardNumber: z.string().optional().refine(val => !val || /^\d{16}$/.test(val), {
    message: "Le numéro de carte doit comporter 16 chiffres."
  }),
  expiryDate: z.string().optional().refine(val => !val || /^\d{4}-\d{2}$/.test(val), {
    message: "Date d'expiration invalide."
  }),
  cvc: z.string().optional().refine(val => !val || /^\d{3}$/.test(val), {
    message: "Le CVC doit comporter 3 chiffres."
  }),
  cardName: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutForm() {
  const [, navigate] = useLocation();
  const { cartItems, clearCart } = useCart();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<"cash_on_delivery" | "credit_card">("cash_on_delivery");
  const [cardType, setCardType] = useState<"visa" | "mastercard" | null>(null);
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    return {
      value: monthNum.toString().padStart(2, '0'),
      label: monthNum.toString().padStart(2, '0'),
    };
  });
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState(currentYear.toString());
  const filteredMonths = months;
  const { user } = useAuth();

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

  // Pre-fill form with user info if signed in
  useEffect(() => {
    if (user) {
      apiRequest("GET", "/api/me").then((userInfo) => {
        form.reset({
          customerName: userInfo.fullname || userInfo.username || "",
          customerEmail: userInfo.email || "",
          customerPhone: userInfo.phone || "",
          shippingAddress: userInfo.address || "",
          city: userInfo.city || "",
          postalCode: userInfo.postalCode || "",
          paymentMethod: "cash_on_delivery",
        });
      });
    }
  }, [user]);

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
    onSuccess: async (data) => {
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
    // For credit card, combine expiryMonth and expiryYear
    if (paymentMethod === 'credit_card') {
      if (!expiryMonth || !expiryYear) {
        toast({ title: 'Erreur', description: 'Veuillez sélectionner le mois et l\'année d\'expiration.', variant: 'destructive' });
        return;
      }
      data.expiryDate = `${expiryYear}-${expiryMonth}`;
    }
    // Submit order
    orderMutation.mutate(data);
  };

  // Card type detection and formatting
  const formatCardNumber = (value: string) => value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    field.onChange(raw);
    // Detect card type
    if (/^4/.test(raw)) setCardType("visa");
    else if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(raw)) setCardType("mastercard");
    else setCardType(null);
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
                    <FormField
                      control={form.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numéro de carte</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                                value={field.value ? formatCardNumber(field.value) : ""}
                                onChange={e => handleCardNumberChange(e, field)}
                                inputMode="numeric"
                                className="pr-12"
                              />
                              {cardType === "visa" && (
                                <img src={window.location.hostname === 'kamalaassab.github.io' ? '/visa.svg' : '/visa.svg'} alt="Visa" className="absolute right-3 top-1/2 -translate-y-1/2 h-6" />
                              )}
                              {cardType === "mastercard" && (
                                <img src={window.location.hostname === 'kamalaassab.github.io' ? '/mastercard.svg' : '/mastercard.svg'} alt="Mastercard" className="absolute right-3 top-1/2 -translate-y-1/2 h-6" />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                      <FormField
                        control={form.control}
                        name="expiryDate"
                      render={() => (
                          <FormItem>
                            <FormLabel>Date d'expiration</FormLabel>
                          <div className="flex gap-2">
                            <div className="w-1/2">
                              <select
                                value={expiryMonth}
                                onChange={e => setExpiryMonth(e.target.value)}
                                required={paymentMethod === 'credit_card'}
                                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-base bg-white"
                              >
                                <option value="">Mois</option>
                                {filteredMonths.map(m => (
                                  <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="w-1/2">
                              <select
                                value={expiryYear}
                                onChange={e => {
                                  setExpiryYear(e.target.value);
                                  // Reset month if year changes
                                  if (e.target.value !== currentYear.toString() && expiryMonth === '') {
                                    setExpiryMonth('01');
                                  }
                                }}
                                required={paymentMethod === 'credit_card'}
                                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-base bg-white"
                              >
                                {years.map(y => (
                                  <option key={y} value={y}>{y}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    
                      <FormField
                        control={form.control}
                        name="cvc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVC</FormLabel>
                            <FormControl>
                            <Input placeholder="123" maxLength={3} inputMode="numeric" pattern="\d{3}" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    
                    <FormField
                      control={form.control}
                      name="cardName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom sur la carte</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
