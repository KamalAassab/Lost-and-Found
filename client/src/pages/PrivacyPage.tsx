import React from "react";
import { ShopLogo } from "@/components/ui/shop-logo";
import { Link } from "wouter";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function PrivacyPage() {
  React.useEffect(() => {
    window.scrollTo(0, 0);
    const original = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#000';
    return () => { document.body.style.backgroundColor = original; };
  }, []);

  return (
    <div className="container mx-auto py-10 max-w-3xl bg-black text-white rounded-xl shadow-lg min-h-screen">
      <div className="flex justify-center mb-8">
        <Link href="/">
          <ShopLogo className="h-14 w-auto hover:opacity-80 transition" />
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-6 text-white">Politique de confidentialité</h1>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-white">1. Collecte des informations</h2>
        <p className="text-gray-200">Nous recueillons des informations lorsque vous vous inscrivez sur notre site, passez une commande, vous abonnez à notre newsletter ou remplissez un formulaire. Les informations collectées incluent votre nom, votre adresse e-mail, votre adresse postale et votre numéro de téléphone.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-white">2. Utilisation des informations</h2>
        <p className="text-gray-200">Toutes les informations que nous recueillons auprès de vous peuvent être utilisées pour :<br />- Traiter vos commandes<br />- Améliorer notre site web<br />- Améliorer le service client<br />- Vous contacter par e-mail<br />- Administrer un concours, une promotion ou une enquête</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-white">3. Confidentialité des informations</h2>
        <p className="text-gray-200">Nous sommes les seuls propriétaires des informations recueillies sur ce site. Vos informations personnelles ne seront pas vendues, échangées, transférées ou données à une autre société pour n'importe quelle raison, sans votre consentement, en dehors de ce qui est nécessaire pour répondre à une demande et/ou une transaction, comme par exemple pour expédier une commande.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-white">4. Divulgation à des tiers</h2>
        <p className="text-gray-200">Nous ne vendons, n'échangeons et ne transférons pas vos informations personnelles identifiables à des tiers. Cela ne comprend pas les tierce parties de confiance qui nous aident à exploiter notre site Web ou à mener nos affaires, tant que ces parties conviennent de garder ces informations confidentielles.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-white">5. Protection des informations</h2>
        <p className="text-gray-200">Nous mettons en œuvre une variété de mesures de sécurité pour préserver la sécurité de vos informations personnelles. Nous utilisons un cryptage à la pointe de la technologie pour protéger les informations sensibles transmises en ligne.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-white">6. Consentement</h2>
        <p className="text-gray-200">En utilisant notre site, vous consentez à notre politique de confidentialité. Pour toute question, contactez-nous à <a href="mailto:support@lostandfound.ma" className="text-white underline">support@lostandfound.ma</a>.</p>
      </section>

      <section className="mt-12 pt-8 border-t border-neutral-800">
        <h2 className="text-2xl font-bold mb-6 text-white">Contactez-nous</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-white mt-1" />
              <div>
                <h3 className="font-semibold text-white">Adresse</h3>
                <p className="text-gray-300">LOST & FOUND<br />Settat, Maroc</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-white mt-1" />
              <div>
                <h3 className="font-semibold text-white">Téléphone</h3>
                <p className="text-gray-300">+212 642 05 78 69</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-white mt-1" />
              <div>
                <h3 className="font-semibold text-white">Email</h3>
                <p className="text-gray-300">support@lostandfound.ma</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-white mt-1" />
              <div>
                <h3 className="font-semibold text-white">Horaires d'Ouverture</h3>
                <p className="text-gray-300">
                  Lundi - Vendredi: 9h00 - 18h00<br />
                  Samedi: 10h00 - 16h00<br />
                  Dimanche: Fermé
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 