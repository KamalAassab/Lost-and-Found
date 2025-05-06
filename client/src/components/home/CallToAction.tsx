import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

export default function CallToAction() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une adresse email valide",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('POST', '/api/subscribe', { email });
      toast({
        title: "Succès",
        description: "Merci pour votre inscription à notre newsletter!",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1600&h=600"
          alt="Urban street fashion"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-montserrat uppercase mb-4 text-white">
          Rejoignez le mouvement
        </h2>
        <p className="text-neutral-200 max-w-xl mx-auto mb-8">
          Inscrivez-vous à notre newsletter pour recevoir les dernières actualités et offres exclusives.
        </p>

        <form 
          className="flex flex-col sm:flex-row max-w-md mx-auto"
          onSubmit={handleSubmit}
        >
          <Input
            type="email"
            placeholder="Votre adresse email"
            className="flex-grow py-3 px-4 outline-none rounded-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
          <Button 
            type="submit"
            className="bg-accent text-white font-bold py-3 px-6 sm:px-8 uppercase text-sm tracking-wider hover:bg-red-600 transition duration-300 mt-2 sm:mt-0 rounded-none"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            S'inscrire
          </Button>
        </form>
      </div>
    </section>
  );
}
