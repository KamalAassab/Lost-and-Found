import React from "react";
import SupportLayout from "@/components/support/SupportLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
  return (
    <SupportLayout title="Questions Fréquentes">
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Comment passer une commande ?</AccordionTrigger>
            <AccordionContent>
              Pour passer une commande, suivez ces étapes simples :
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Parcourez notre catalogue et ajoutez les articles souhaités à votre panier</li>
                <li>Cliquez sur l'icône du panier pour voir votre sélection</li>
                <li>Vérifiez vos articles et quantités</li>
                <li>Cliquez sur "Passer à la caisse"</li>
                <li>Remplissez vos informations de livraison et de paiement</li>
                <li>Confirmez votre commande</li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Quels moyens de paiement acceptez-vous ?</AccordionTrigger>
            <AccordionContent>
              Nous acceptons les moyens de paiement suivants :
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Cartes bancaires (Visa, Mastercard)</li>
                <li>Paiement à la livraison</li>
                <li>Virement bancaire</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Comment suivre ma commande ?</AccordionTrigger>
            <AccordionContent>
              Une fois votre commande confirmée, vous recevrez un email avec votre numéro de suivi. Vous pouvez également suivre votre commande dans votre espace client en vous connectant à votre compte.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Comment modifier ou annuler ma commande ?</AccordionTrigger>
            <AccordionContent>
              Pour modifier ou annuler votre commande, contactez-nous immédiatement par email à support@lostandfound.ma ou par téléphone au +212 642 05 78 69. Nous ferons de notre mieux pour vous aider, mais notez que les modifications ne sont possibles que si la commande n'a pas encore été expédiée.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>Comment créer un compte ?</AccordionTrigger>
            <AccordionContent>
              Pour créer un compte :
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Cliquez sur l'icône "Mon compte" en haut à droite</li>
                <li>Sélectionnez "Créer un compte"</li>
                <li>Remplissez le formulaire avec vos informations</li>
                <li>Confirmez votre email</li>
                <li>Votre compte est créé !</li>
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </SupportLayout>
  );
} 