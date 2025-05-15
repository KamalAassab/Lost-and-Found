import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "wouter";
import { ShopLogo } from "@/components/ui/shop-logo";
import { CheckCircle } from "lucide-react";

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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-0">
      <div className="fixed top-0 left-0 w-full flex justify-center items-center bg-black z-10" style={{height: '110px'}}>
        <Link href="/">
          <ShopLogo className="h-20 w-auto text-white mx-auto" />
        </Link>
      </div>
      <div className="max-w-md w-full pt-[130px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Récupérer le compte</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Adresse email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="Votre email"
                  className="w-full"
                />
              </div>
              <Button type="submit" className="w-full">
                Envoyer le code
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Link href="/login" className="text-primary hover:underline">
                Retour à la connexion
              </Link>
            </div>
          </CardContent>
        </Card>
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