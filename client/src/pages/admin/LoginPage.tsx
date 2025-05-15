import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { ShopLogo } from "@/components/ui/shop-logo";
import { useAuth } from "@/context/AuthContext";

// Form schema
const loginSchema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login, user, isLoading } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = "Connexion | LOST & FOUND";
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/account");
      }
    }
  }, [user, navigate]);

  // Form handling
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setLoginError(null);
    await login(values.username, values.password);
    // Redirect logic removed from here; handled by useEffect
  };

  if (user || isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-0">
      {/* Full-width, full-black header with no margins or padding */}
      <div className="fixed top-0 left-0 w-full flex justify-center items-center bg-black z-10" style={{height: '110px'}}>
          <Link href="/">
          <ShopLogo className="h-20 w-auto text-white mx-auto" />
          </Link>
        </div>
      <div className="max-w-md w-full pt-[130px]">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Connexion</CardTitle>
            <CardDescription className="text-center">
              Connectez-vous à votre compte
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom d'utilisateur</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nom d'utilisateur" 
                          {...field} 
                          disabled={form.formState.isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                        <Input 
                            type={showPassword ? "text" : "password"}
                          placeholder="••••••••" 
                          {...field} 
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                            tabIndex={-1}
                            onClick={() => setShowPassword((v) => !v)}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {loginError && (
                  <div className="text-destructive text-sm">{loginError}</div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>
              </form>
            </Form>
            <div className="w-full text-center text-sm mt-2">
              <Link href="/recover" className="text-primary hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <div className="mt-4 text-center">
              <span className="text-sm text-muted-foreground">
                Pas encore de compte ?{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  Créer un compte
                </Link>
              </span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
