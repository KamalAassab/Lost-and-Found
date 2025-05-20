import React from "react";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface AuthPopupProps {
  open: boolean;
  onClose: () => void;
}

export function AuthPopup({ open, onClose }: AuthPopupProps) {
  const { user } = useAuth();

  if (user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Connexion requise</DialogTitle>
          <DialogDescription className="text-center">
            Connectez-vous pour ajouter des produits à vos favoris
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <Link href="/login">
            <Button 
              className="w-full bg-black hover:bg-black/90 text-white"
              onClick={onClose}
            >
              Se connecter
            </Button>
          </Link>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-neutral-500">ou</span>
            </div>
          </div>
          <Link href="/signup">
            <Button 
              variant="outline" 
              className="w-full border-black hover:bg-black hover:text-white"
              onClick={onClose}
            >
              Créer un compte
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
} 