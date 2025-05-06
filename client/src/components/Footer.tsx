import React from "react";
import { Link } from "wouter";
import { ShopLogo } from "@/components/ui/shop-logo";
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
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
    <footer className="bg-primary text-white pt-16 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold font-montserrat mb-4">
              <ShopLogo className="h-8 w-auto" />
            </h3>
            <p className="text-neutral-400 mb-4">
              Votre destination streetwear authentique pour exprimer votre style unique.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Liens Rapides</h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <Link href="/">
                  <a className="hover:text-white transition-colors">Accueil</a>
                </Link>
              </li>
              <li>
                <Link href="/products/hoodie">
                  <a className="hover:text-white transition-colors">Hoodies</a>
                </Link>
              </li>
              <li>
                <Link href="/products/tshirt">
                  <a className="hover:text-white transition-colors">T-Shirts</a>
                </Link>
              </li>
              <li>
                <Link href="/products">
                  <a className="hover:text-white transition-colors">Promotions</a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Aide & Support</h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Livraison
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Retours
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Tailles
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-neutral-400">
              <li className="flex items-start">
                <MapPin className="mt-1 mr-3 h-4 w-4" />
                <span>123 Rue de la Mode, Casablanca, Maroc</span>
              </li>
              <li className="flex items-start">
                <Phone className="mt-1 mr-3 h-4 w-4" />
                <span>+212 5XX XX XX XX</span>
              </li>
              <li className="flex items-start">
                <Mail className="mt-1 mr-3 h-4 w-4" />
                <span>info@lostandfound.ma</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-800 text-sm text-neutral-500 flex flex-col md:flex-row justify-between items-center">
          <p>© 2023 LOST & FOUND. Tous droits réservés.</p>
          <div className="flex flex-wrap justify-center mt-4 md:mt-0">
            <a href="#" className="mr-6 hover:text-white transition-colors">
              Conditions d'utilisation
            </a>
            <a href="#" className="mr-6 hover:text-white transition-colors">
              Politique de confidentialité
            </a>
            <div className="flex items-center mt-2 md:mt-0">
              <span className="mr-2">Paiement sécurisé:</span>
              <svg className="h-6 w-6 mx-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
              </svg>
              <svg className="h-6 w-6 mx-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 14H5c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
