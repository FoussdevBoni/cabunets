// src/components/sections/FAQSection.tsx

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Qui peut devenir affilié ?",
    answer:
      "Toute personne majeure disposant d'un numéro de téléphone vérifié peut s'inscrire comme affilié, après acceptation des conditions du programme.",
  },
  {
    question: "Combien puis-je gagner ?",
    answer:
      "Le montant dépend des règles configurées par Cabukaka SARLU : prime fixe, pourcentage de la commande, ou combinaison des deux. Vous voyez vos gains en temps réel dans votre tableau de bord.",
  },
  {
    question: "Quand mes commissions sont-elles payables ?",
    answer:
      "Après un délai de validation (par défaut 7 jours après la livraison), les commissions passent en « disponible » et peuvent être retirées.",
  },
  {
    question: "Comment retirer mes gains ?",
    answer:
      "Via Mobile Money (Airtel, Vodacom, Orange, Africell) ou par paiement manuel. Vous faites une demande, l'admin vérifie et effectue le paiement.",
  },
  {
    question: "Puis-je parrainer mon propre compte ?",
    answer:
      "Non. L'auto-parrainage est strictement interdit et détecté automatiquement.",
  },
  {
    question: "Que se passe-t-il si une commande est annulée ?",
    answer:
      "Si une commande est annulée ou remboursée avant validation, la commission correspondante est annulée automatiquement.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Questions fréquentes
          </h2>
          <p className="text-gray-600">
            Vous avez des questions ? Voici les réponses les plus courantes.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 transition"
                >
                  <span className="font-medium text-gray-900">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`text-gray-500 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-sm text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}