// src/components/layouts/PublicFooter.tsx

import { Link } from "react-router-dom";

export function PublicFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-white">CabuAffili</span>
            </div>
            <p className="text-sm text-gray-400 max-w-md">
              Le programme d'affiliation de Cabunets. Parrainez vos amis et gagnez
              des récompenses sur chaque conversion admissible.
            </p>
          </div>

          {/* Programme */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Programme</h3>
            <ul className="space-y-2">
              <li>
                <a href="#how-it-works" className="text-sm hover:text-white">
                  Comment ça marche
                </a>
              </li>
              <li>
                <a href="#benefits" className="text-sm hover:text-white">
                  Avantages
                </a>
              </li>
              <li>
                <a href="#faq" className="text-sm hover:text-white">
                  FAQ
                </a>
              </li>
              <li>
                <Link to="/auth/register" className="text-sm hover:text-white">
                  S'inscrire
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-sm hover:text-white">
                  Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm hover:text-white">
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">
            © 2026 CabuAffili — Cabukaka SARLU. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}