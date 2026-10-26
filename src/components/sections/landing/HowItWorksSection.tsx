// src/components/sections/HowItWorksSection.tsx

import { Link2, UserPlus, CheckCircle, Wallet } from "lucide-react";

const steps = [
  {
    icon: Link2,
    title: "1. Partagez votre lien",
    description:
      "Recevez un lien unique et un code personnel. Partagez-les sur WhatsApp ou via vos réseaux.",
  },
  {
    icon: UserPlus,
    title: "2. Vos filleuls s'inscrivent",
    description:
      "Chaque personne qui s'inscrit avec votre code est liée à vous de façon permanente.",
  },
  {
    icon: CheckCircle,
    title: "3. Ils commandent",
    description:
      "Quand votre filleul passe une commande admissible, une commission est calculée.",
  },
  {
    icon: Wallet,
    title: "4. Vous retirez",
    description:
      "Dès que la commission est validée, vous pouvez demander un retrait Mobile Money.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-gray-600">
            Quatre étapes simples pour gagner vos premières commissions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="text-primary" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}