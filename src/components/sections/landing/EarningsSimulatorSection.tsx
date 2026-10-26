// src/components/sections/EarningsSimulatorSection.tsx

import { useState } from "react";
import { Calculator } from "lucide-react";

export function EarningsSimulatorSection() {
  const [referralsPerMonth, setReferralsPerMonth] = useState(10);
  const [commissionPerReferral, setCommissionPerReferral] = useState(500);

  const monthlyEarnings = referralsPerMonth * commissionPerReferral;
  const yearlyEarnings = monthlyEarnings * 12;

  const formatAmount = (value: number) =>
    new Intl.NumberFormat("fr-FR").format(value);

  return (
    <section id="simulator" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Simulez vos gains
          </h2>
          <p className="text-gray-600">
            Découvrez combien vous pourriez gagner selon votre activité.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calculator className="text-primary" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Simulateur
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Slider 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filleuls par mois
              </label>
              <input
                type="range"
                min={1}
                max={100}
                value={referralsPerMonth}
                onChange={(e) => setReferralsPerMonth(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <p className="text-sm text-gray-600 mt-2">
                {referralsPerMonth} filleul{referralsPerMonth > 1 ? "s" : ""}
              </p>
            </div>

            {/* Slider 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission par filleul (CDF)
              </label>
              <input
                type="range"
                min={100}
                max={2000}
                step={50}
                value={commissionPerReferral}
                onChange={(e) =>
                  setCommissionPerReferral(Number(e.target.value))
                }
                className="w-full accent-primary"
              />
              <p className="text-sm text-gray-600 mt-2">
                {formatAmount(commissionPerReferral)} CDF
              </p>
            </div>
          </div>

          {/* Résultats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-primary/5 rounded-xl">
            <div>
              <p className="text-xs text-gray-600 mb-1">Gains mensuels</p>
              <p className="text-2xl font-bold text-primary">
                {formatAmount(monthlyEarnings)} CDF
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Gains annuels</p>
              <p className="text-2xl font-bold text-primary">
                {formatAmount(yearlyEarnings)} CDF
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Simulation indicative. Les montants réels dépendent des règles
            configurées par Cabukaka SARLU.
          </p>
        </div>
      </div>
    </section>
  );
}