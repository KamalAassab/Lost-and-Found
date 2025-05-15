import React from "react";
import { ShopLogo } from "@/components/ui/shop-logo";
import { Link } from "wouter";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function TermsPage() {
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
      <h1 className="text-3xl font-bold mb-6 text-white">Conditions d'utilisation</h1>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-white">1. Acceptation des conditions</h2>
        <p className="text-gray-200">En accédant et en utilisant ce site, vous acceptez d'être lié par les présentes conditions d'utilisation, toutes les lois et réglementations applicables, et acceptez que vous êtes responsable du respect de toutes les lois locales applicables.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-white">2. Utilisation du site</h2>
        <p className="text-gray-200">Vous vous engagez à utiliser ce site uniquement à des fins légales et conformément aux présentes conditions. Il est interdit d'utiliser ce site pour transmettre du contenu illégal, menaçant, diffamatoire, obscène ou autrement répréhensible.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-white">3. Propriété intellectuelle</h2>
        <p className="text-gray-200">Tout le contenu présent sur ce site, y compris les textes, images, logos et graphismes, est la propriété de LOST & FOUND ou de ses partenaires et est protégé par les lois sur la propriété intellectuelle. Toute reproduction ou utilisation sans autorisation est strictement interdite.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-white">4. Modifications des conditions</h2>
        <p className="text-gray-200">LOST & FOUND se réserve le droit de modifier ces conditions d'utilisation à tout moment. Les modifications prendront effet dès leur publication sur le site. Il vous incombe de consulter régulièrement les conditions d'utilisation.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-white">5. Limitation de responsabilité</h2>
        <p className="text-gray-200">LOST & FOUND ne pourra être tenu responsable des dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utiliser ce site.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-white">6. Contact</h2>
        <p className="text-gray-200">Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter à <a href="mailto:support@lostandfound.ma" className="text-white underline">support@lostandfound.ma</a>.</p>
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