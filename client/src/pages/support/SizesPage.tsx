import React from "react";
import SupportLayout from "@/components/support/SupportLayout";
import { Ruler, Info } from "lucide-react";

export default function SizesPage() {
  return (
    <SupportLayout title="Guide des Tailles">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-neutral-50 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Ruler className="h-6 w-6 mr-3 text-primary" />
            <h3 className="text-lg font-semibold">Comment Prendre vos Mesures</h3>
          </div>
          <div className="space-y-4 text-neutral-600">
            <p>Pour trouver votre taille idéale, suivez ces étapes :</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Utilisez un mètre ruban souple</li>
              <li>Mesurez-vous en sous-vêtements</li>
              <li>Ne serrez pas trop le mètre ruban</li>
              <li>Prenez les mesures suivantes :</li>
            </ol>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Tour de poitrine : mesurez à la partie la plus large</li>
              <li>Tour de taille : mesurez à la partie la plus fine</li>
              <li>Tour de hanches : mesurez à la partie la plus large</li>
              <li>Longueur des épaules : d'une épaule à l'autre</li>
            </ul>
          </div>
        </div>

        <div className="bg-neutral-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Guide des Tailles - T-Shirts</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral-100">
                  <th className="p-3 text-left">Taille</th>
                  <th className="p-3 text-left">Tour de Poitrine</th>
                  <th className="p-3 text-left">Tour de Taille</th>
                  <th className="p-3 text-left">Longueur</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">S</td>
                  <td className="p-3">90-95 cm</td>
                  <td className="p-3">80-85 cm</td>
                  <td className="p-3">65 cm</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">M</td>
                  <td className="p-3">95-100 cm</td>
                  <td className="p-3">85-90 cm</td>
                  <td className="p-3">67 cm</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">L</td>
                  <td className="p-3">100-105 cm</td>
                  <td className="p-3">90-95 cm</td>
                  <td className="p-3">69 cm</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">XL</td>
                  <td className="p-3">105-110 cm</td>
                  <td className="p-3">95-100 cm</td>
                  <td className="p-3">71 cm</td>
                </tr>
                <tr>
                  <td className="p-3">XXL</td>
                  <td className="p-3">110-115 cm</td>
                  <td className="p-3">100-105 cm</td>
                  <td className="p-3">73 cm</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-neutral-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Guide des Tailles - Hoodies</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral-100">
                  <th className="p-3 text-left">Taille</th>
                  <th className="p-3 text-left">Tour de Poitrine</th>
                  <th className="p-3 text-left">Tour de Taille</th>
                  <th className="p-3 text-left">Longueur</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">S</td>
                  <td className="p-3">95-100 cm</td>
                  <td className="p-3">85-90 cm</td>
                  <td className="p-3">67 cm</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">M</td>
                  <td className="p-3">100-105 cm</td>
                  <td className="p-3">90-95 cm</td>
                  <td className="p-3">69 cm</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">L</td>
                  <td className="p-3">105-110 cm</td>
                  <td className="p-3">95-100 cm</td>
                  <td className="p-3">71 cm</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">XL</td>
                  <td className="p-3">110-115 cm</td>
                  <td className="p-3">100-105 cm</td>
                  <td className="p-3">73 cm</td>
                </tr>
                <tr>
                  <td className="p-3">XXL</td>
                  <td className="p-3">115-120 cm</td>
                  <td className="p-3">105-110 cm</td>
                  <td className="p-3">75 cm</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-accent/10 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Info className="h-6 w-6 mr-3 text-primary" />
            <h3 className="text-lg font-semibold">Informations Importantes</h3>
          </div>
          <ul className="space-y-3 text-neutral-600">
            <li>• Les mesures sont données à titre indicatif</li>
            <li>• Les tailles peuvent varier selon le style et le modèle</li>
            <li>• En cas de doute, prenez la taille au-dessus</li>
            <li>• Pour toute question concernant les tailles, contactez-nous au +212 642 05 78 69</li>
          </ul>
        </div>
      </div>
    </SupportLayout>
  );
} 