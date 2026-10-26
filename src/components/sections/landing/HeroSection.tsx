// src/components/sections/HeroSection.tsx

import { Link } from "react-router-dom";
import { ArrowRight, Users, Coins, TrendingUp } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-white to-primary/10 pt-16 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Texte */}
          <div>
            <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-4">
              Programme d'affiliation Cabunets
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Parrainez, gagnez,{" "}
              <span className="text-primary">grandissez</span> avec nous
            </h1>

            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              Rejoignez CabuAffili et recevez des récompenses pour chaque
              vendeur activé ou client qui passe sa première commande.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/auth/register"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
              >
                Devenir affilié
                <ArrowRight size={18} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Comment ça marche
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-sm text-gray-600">Programmes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">7j</p>
                <p className="text-sm text-gray-600">Délai moyen</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">24/7</p>
                <p className="text-sm text-gray-600">Retrait digital</p>
              </div>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative hidden lg:block">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              {/* Card commission */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ma commission</p>
                  <p className="text-3xl font-bold text-gray-900">500 CDF</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
              </div>

              {/* Détail */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="text-primary" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Nouveau filleul</p>
                    <p className="text-xs text-gray-500">+1 inscrit</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                    <Coins className="text-green-600" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Commission créditée</p>
                    <p className="text-xs text-gray-500">+500 CDF</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Badge flottant */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <p className="text-xs text-gray-500">Total disponible</p>
              <p className="text-xl font-bold text-primary">2 500 CDF</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}