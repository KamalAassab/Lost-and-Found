import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, ArrowLeft, User2, Mail, Lock } from "lucide-react";

const signupSchema = z.object({
  username: z.string().min(4, "Le nom d'utilisateur doit comporter au moins 4 caractères"),
  email: z.string().email("Veuillez fournir un email valide"),
  password: z.string().min(8, "Le mot de passe doit comporter au moins 8 caractères"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const signupMutation = useMutation({
    mutationFn: async (data: SignupForm) => {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Une erreur est survenue lors de l'inscription");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Inscription réussie",
        description: "Vous pouvez maintenant vous connecter",
      });
      navigate("/login");
    },
    onError: (error: Error) => {
      let description = error.message;
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.errors && Array.isArray(parsed.errors)) {
          description = parsed.errors.map((e: any) => e.message).join("\n");
        } else if (parsed.message) {
          description = parsed.message;
        }
      } catch {}
      toast({
        variant: "destructive",
        title: "Erreur",
        description,
      });
    },
  });

  const onSubmit = (data: SignupForm) => {
    signupMutation.mutate(data);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4" style={{ backgroundImage: `url(${window.location.hostname === 'kamalaassab.github.io' ? '/bigbanner.png' : '/bigbanner.png'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
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
          <h1 className="text-xl font-bold text-center mb-1 font-montserrat">Inscription</h1>
          <p className="text-center text-gray-500 mb-3 text-xs">Créez un compte pour accéder à toutes les fonctionnalités</p>
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
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <Mail className="h-5 w-5" />
                        </span>
                        <Input
                          type="email"
                          className="pl-10 py-2 rounded-lg border-gray-200 focus:border-black focus:ring-2 focus:ring-black/20 text-sm"
                          placeholder="Votre email"
                          {...field}
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <Lock className="h-5 w-5" />
                        </span>
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          className="pl-10 py-2 rounded-lg border-gray-200 focus:border-black focus:ring-2 focus:ring-black/20 text-sm"
                          placeholder="••••••••"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black focus:outline-none"
                          tabIndex={-1}
                          onClick={() => setShowConfirmPassword((v) => !v)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full py-2 rounded-lg text-sm font-semibold bg-black hover:bg-gray-900 transition"
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? "Inscription..." : "S'inscrire"}
              </Button>
            </form>
          </Form>
          <div className="flex items-center my-3">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-4 text-gray-400 text-xs uppercase tracking-widest">ou</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>
          <div className="w-full text-center text-xs">
            <span className="text-gray-500/80">Vous avez déjà un compte ? </span>
            <Link href="/login" className="text-black font-semibold hover:underline transition">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 