import React from "react";
import SupportLayout from "@/components/support/SupportLayout";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    try {
      console.log("About to send POST to /api/messages");
      const response = await apiRequest("POST", "/api/messages", { name, email, subject, message });
      console.log("POST request sent!", response);
      if (response && response.id) {
        toast({
          title: "Message envoyé",
          description: "Nous vous répondrons dans les plus brefs délais.",
        });
        (e.target as HTMLFormElement).reset();
      } else {
        throw new Error("Le message n'a pas pu être enregistré. Veuillez réessayer.");
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error?.message || "Une erreur est survenue lors de l'envoi du message.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SupportLayout title="Contact">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-neutral-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <MapPin className="h-6 w-6 mr-3 text-primary" />
                <h3 className="text-lg font-semibold">Adresse</h3>
              </div>
              <p className="text-neutral-600">
                LOST & FOUND<br />
                Settat, Maroc
              </p>
            </div>

            <div className="bg-neutral-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Phone className="h-6 w-6 mr-3 text-primary" />
                <h3 className="text-lg font-semibold">Téléphone</h3>
              </div>
              <p className="text-neutral-600">
                +212 642 05 78 69
              </p>
            </div>

            <div className="bg-neutral-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Mail className="h-6 w-6 mr-3 text-primary" />
                <h3 className="text-lg font-semibold">Email</h3>
              </div>
              <p className="text-neutral-600">
                support@lostandfound.ma
              </p>
            </div>

            <div className="bg-neutral-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 mr-3 text-primary" />
                <h3 className="text-lg font-semibold">Horaires d'Ouverture</h3>
              </div>
              <p className="text-neutral-600">
                Lundi - Vendredi: 9h00 - 18h00<br />
                Samedi: 10h00 - 16h00<br />
                Dimanche: Fermé
              </p>
            </div>
          </div>

          <div className="bg-neutral-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-6">Envoyez-nous un message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Nom complet
                </label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Votre nom"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="votre@email.com"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Sujet
                </label>
                <Input
                  id="subject"
                  name="subject"
                  required
                  placeholder="Sujet de votre message"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  placeholder="Votre message"
                  className="w-full min-h-[150px]"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
              </Button>
            </form>
          </div>
        </div>

        <div className="bg-accent/10 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Informations Importantes</h3>
          <ul className="space-y-3 text-neutral-600">
            <li>• Nous répondons généralement dans les 24 heures ouvrables</li>
            <li>• Pour les urgences, privilégiez l'appel téléphonique</li>
            <li>• Les demandes de retour doivent être faites par email</li>
            <li>• Pour les questions sur les commandes, mentionnez votre numéro de commande</li>
          </ul>
        </div>
      </div>
    </SupportLayout>
  );
} 