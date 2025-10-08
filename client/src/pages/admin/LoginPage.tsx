import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff, User2, Lock, ArrowLeft } from "lucide-react";
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
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4" style={{ backgroundImage: 'url(/bigbanner.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="relative w-full max-w-xs z-10">
        <div className="relative bg-white/90 rounded-2xl shadow-xl px-3 py-3 md:px-4 md:py-4">
          <Link href="/" className="absolute left-4 top-4">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 shadow transition focus:outline-none focus:ring-2 focus:ring-black/20"
              aria-label="Retour à l'accueil"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <h1 className="text-xl font-bold text-center mb-1 font-montserrat">Connexion</h1>
          <p className="text-center text-gray-500 mb-3 text-xs">Connectez-vous à votre compte</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Nom d'utilisateur</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <User2 className="h-5 w-5" />
                        </span>
                        <Input
                          className="pl-10 py-2 rounded-lg border-gray-200 focus:border-black focus:ring-2 focus:ring-black/20 text-sm"
                          placeholder="Nom d'utilisateur"
                          {...field}
                          disabled={form.formState.isSubmitting}
                        />
                      </div>
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
                    <FormLabel className="text-xs font-semibold">Mot de passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <Lock className="h-5 w-5" />
                        </span>
                        <Input
                          type={showPassword ? "text" : "password"}
                          className="pl-10 py-2 rounded-lg border-gray-200 focus:border-black focus:ring-2 focus:ring-black/20 text-sm"
                          placeholder="••••••••"
                          {...field}
                          disabled={form.formState.isSubmitting}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black focus:outline-none"
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
                <div className="text-red-500 text-sm text-center font-medium">{loginError}</div>
              )}
              <Button
                type="submit"
                className="w-full py-2 rounded-lg text-sm font-semibold bg-black hover:bg-gray-900 transition"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          </Form>
          <div className="flex items-center my-3">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-4 text-gray-400 text-xs uppercase tracking-widest">ou</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>
          <div className="w-full text-center text-xs mb-1">
            <Link href="/recover" className="text-black font-semibold hover:underline transition">
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="w-full text-center text-xs">
            <span className="text-gray-500">Pas encore de compte ? </span>
            <Link href="/signup" className="text-black font-semibold hover:underline transition">
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
