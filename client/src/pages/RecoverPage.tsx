import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "wouter";
import { CheckCircle, ArrowLeft, Mail } from "lucide-react";

export default function RecoverPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowPopup(true);
    try {
      const res = await fetch("/api/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Code envoyé",
          description: "Un code de récupération a été envoyé à votre adresse email.",
        });
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Impossible d'envoyer le code de récupération.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4" style={{ backgroundImage: 'url(/bigbanner.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="relative w-full max-w-sm z-10">
        <div className="bg-white/90 rounded-2xl shadow-xl px-3 py-3 md:px-4 md:py-4">
          <Link href="/login" className="absolute left-4 top-4">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 shadow transition focus:outline-none focus:ring-2 focus:ring-black/20"
              aria-label="Retour à la connexion"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <h1 className="text-xl font-bold text-center mb-1 font-montserrat">Récupérer le compte</h1>
          <p className="text-center text-gray-500 mb-3 text-xs">Entrez votre adresse email pour recevoir un code de récupération</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold mb-2">
                Adresse email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="h-5 w-5" />
                </span>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="Votre email"
                  className="w-full pl-10 py-2 rounded-lg border-gray-200 focus:border-black focus:ring-2 focus:ring-black/20 text-sm"
                />
              </div>
            </div>
            <Button type="submit" className="w-full py-2 rounded-lg text-sm font-semibold bg-black hover:bg-gray-900 transition">
              Envoyer le code
            </Button>
          </form>
          <div className="flex items-center my-3">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-4 text-gray-400 text-xs uppercase tracking-widest">ou</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>
          <div className="w-full text-center text-xs">
            <Link href="/login" className="text-black font-semibold hover:underline transition">
              Retour à la connexion
            </Link>
          </div>
        </div>
        {showPopup && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center transition-all duration-300">
              <CheckCircle className="mx-auto mb-3 text-green-500" size={48} />
              <h2 className="text-lg font-semibold mb-2 text-primary">Code envoyé</h2>
              <p className="mb-4">Le code de récupération a été envoyé à votre email. Veuillez vérifier votre boîte de réception.</p>
              <Button onClick={() => setShowPopup(false)} className="w-full">Fermer</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 