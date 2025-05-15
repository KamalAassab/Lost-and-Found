import React from "react";
import SupportLayout from "@/components/support/SupportLayout";
import { RotateCcw, Clock, AlertCircle, CheckCircle } from "lucide-react";

export default function ReturnsPage() {
  return (
    <SupportLayout title="Retours">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-neutral-50 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <RotateCcw className="h-6 w-6 mr-3 text-primary" />
            <h3 className="text-lg font-semibold">Notre Politique de Retours</h3>
          </div>
          <p className="text-neutral-600 mb-4">
            Chez LOST & FOUND, nous nous engageons à vous offrir une expérience d'achat satisfaisante. Si vous n'êtes pas entièrement satisfait de votre achat, vous disposez de 14 jours pour retourner votre article.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-neutral-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 mr-3 text-primary" />
              <h3 className="text-lg font-semibold">Conditions de Retour</h3>
            </div>
            <ul className="space-y-3 text-neutral-600">
              <li>• L'article doit être dans son état d'origine</li>
              <li>• Tous les tags et étiquettes doivent être présents</li>
              <li>• L'article ne doit pas avoir été porté ou lavé</li>
              <li>• L'emballage d'origine doit être conservé</li>
              <li>• Le délai de retour est de 14 jours</li>
            </ul>
          </div>

          <div className="bg-neutral-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 mr-3 text-primary" />
              <h3 className="text-lg font-semibold">Processus de Retour</h3>
            </div>
            <ol className="list-decimal list-inside space-y-3 text-neutral-600">
              <li>Contactez notre service client</li>
              <li>Remplissez le formulaire de retour</li>
              <li>Emballez l'article avec soin</li>
              <li>Envoyez le colis à notre adresse</li>
              <li>Attendez la confirmation du remboursement</li>
            </ol>
          </div>
        </div>

        <div className="bg-neutral-50 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 mr-3 text-primary" />
            <h3 className="text-lg font-semibold">Articles Non Éligibles</h3>
          </div>
          <ul className="space-y-3 text-neutral-600">
            <li>• Articles personnalisés ou sur mesure</li>
            <li>• Articles en solde ou en promotion</li>
            <li>• Articles portés ou lavés</li>
            <li>• Articles sans étiquette ou tags</li>
            <li>• Articles endommagés par le client</li>
          </ul>
        </div>

        <div className="bg-accent/10 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Remboursement</h3>
          <div className="space-y-4">
            <p className="text-neutral-600">
              • Le remboursement sera effectué dans un délai de 7 à 14 jours ouvrables
            </p>
            <p className="text-neutral-600">
              • Le remboursement sera effectué selon le mode de paiement initial
            </p>
            <p className="text-neutral-600">
              • Les frais de retour sont à la charge du client
            </p>
            <p className="text-neutral-600">
              • Pour toute question concernant votre retour, contactez-nous au +212 642 05 78 69
            </p>
          </div>
        </div>

        <div className="bg-neutral-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Adresse de Retour</h3>
          <p className="text-neutral-600">
            LOST & FOUND<br />
            Settat, Maroc<br />
            Tél: +212 642 05 78 69<br />
            Email: support@lostandfound.ma
          </p>
        </div>
      </div>
    </SupportLayout>
  );
} 