import React from "react";
import { Link } from "wouter";
import { ShopLogo } from "@/components/ui/shop-logo";
import { Facebook, Instagram, MapPin, Phone, Mail, HelpCircle, Truck, RotateCcw, Ruler, MessageCircle } from "lucide-react";
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="p-6 rounded-lg backdrop-blur-sm flex flex-col items-center text-center border border-white/10 bg-white/5 shadow-lg">
            <div className="mb-3">
              <ShopLogo className="h-14 w-auto mx-auto mb-2 drop-shadow-lg" />
            </div>
            <p className="text-neutral-100 mb-4 text-lg font-medium leading-relaxed max-w-xs mx-auto" style={{letterSpacing: '0.01em', fontFamily: "'Grenze Gotisch', serif"}}>
              Votre destination streetwear authentique pour exprimer votre style unique.
            </p>
            <div className="flex justify-center space-x-6 mt-4">
              <a href="#" className="text-neutral-300 hover:text-white transition-colors">
                <Facebook size={22} />
              </a>
              <a href="https://instagram.com/lostandfound_vision" target="_blank" rel="noopener noreferrer" className="text-neutral-300 hover:text-white transition-colors">
                <Instagram size={22} />
              </a>
            </div>
          </div>

          <div className="p-6 rounded-lg backdrop-blur-sm">
            <h4 className="text-lg font-semibold mb-4 text-left">Aide & Support</h4>
            <ul className="space-y-2 text-neutral-400">
              <li className="flex items-start">
                <HelpCircle className="mt-1 mr-3 h-4 w-4" />
                <Link href="/support/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li className="flex items-start">
                <Truck className="mt-1 mr-3 h-4 w-4" />
                <Link href="/support/livraison" className="hover:text-white transition-colors">
                  Livraison
                </Link>
              </li>
              <li className="flex items-start">
                <RotateCcw className="mt-1 mr-3 h-4 w-4" />
                <Link href="/support/retours" className="hover:text-white transition-colors">
                  Retours
                </Link>
              </li>
              <li className="flex items-start">
                <Ruler className="mt-1 mr-3 h-4 w-4" />
                <Link href="/support/tailles" className="hover:text-white transition-colors">
                  Tailles
                </Link>
              </li>
              <li className="flex items-start">
                <MessageCircle className="mt-1 mr-3 h-4 w-4" />
                <Link href="/support/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-lg backdrop-blur-sm">
            <h4 className="text-lg font-semibold mb-4 text-left">Contact</h4>
            <ul className="space-y-2 text-neutral-400">
              <li className="flex items-start">
                <MapPin className="mt-1 mr-3 h-4 w-4" />
                <span>Settat, Maroc</span>
              </li>
              <li className="flex items-start">
                <Phone className="mt-1 mr-3 h-4 w-4" />
                <span>+212 642 05 78 69</span>
              </li>
              <li className="flex items-start">
                <Mail className="mt-1 mr-3 h-4 w-4" />
                <span>support@lostandfound.ma</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-800 text-sm text-neutral-500 flex flex-col md:flex-row justify-between items-center">
          <p>© 2025 LOST & FOUND. Tous droits réservés.</p>
          <div className="flex flex-wrap justify-center mt-4 md:mt-0">
            <Link href="/terms" className="mr-6 hover:text-white transition-colors">
              Conditions d'utilisation
            </Link>
            <Link href="/privacy" className="mr-6 hover:text-white transition-colors">
              Politique de confidentialité
            </Link>
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
