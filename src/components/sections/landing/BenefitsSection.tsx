// src/components/sections/BenefitsSection.tsx

import { Shield, Zap, Banknote, Users } from "lucide-react";

const benefits = [
  {
    icon: Banknote,
    title: "Récompenses attractives",
    description:
      "Des primes fixes et/ou proportionnelles sur chaque conversion admissible.",
  },
  {
    icon: Zap,
    title: "Paiement rapide",
    description:
      "Retraits Mobile Money (Airtel, Vodacom, Orange, Africell) ou paiement manuel.",
  },
  {
    icon: Shield,
    title: "Suivi transparent",
    description:
      "Chaque commission, chaque mouvement visible dans votre historique détaillé.",
  },
  {
    icon: Users,
    title: "Réseau illimité",
    description:
      "Parrainez autant de filleuls que vous voulez. Aucun plafond sur votre réseau.",
  },
];

export function BenefitsSection() {
  return (
    <section id="benefits" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Pourquoi rejoindre CabuAffili ?
          </h2>
          <p className="text-gray-600">
            Un programme simple, transparent et rentable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="flex gap-4 p-6 rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-md transition"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}