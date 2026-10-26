// src/components/layouts/PublicHeader.tsx

import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">CabuAffili</span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-gray-700 hover:text-primary">
              Comment ça marche
            </a>
            <a href="#benefits" className="text-sm text-gray-700 hover:text-primary">
              Avantages
            </a>
            <a href="#simulator" className="text-sm text-gray-700 hover:text-primary">
              Gains
            </a>
            <a href="#faq" className="text-sm text-gray-700 hover:text-primary">
              FAQ
            </a>
          </nav>

          {/* CTA desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/auth/login"
              className="text-sm font-medium text-gray-700 hover:text-primary px-4 py-2"
            >
              Connexion
            </Link>
            <Link
              to="/auth/register"
              className="text-sm font-medium bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 transition"
            >
              Devenir affilié
            </Link>
          </div>

          {/* Burger mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-3">
              <a href="#how-it-works" className="text-sm text-gray-700 py-2">
                Comment ça marche
              </a>
              <a href="#benefits" className="text-sm text-gray-700 py-2">
                Avantages
              </a>
              <a href="#simulator" className="text-sm text-gray-700 py-2">
                Gains
              </a>
              <a href="#faq" className="text-sm text-gray-700 py-2">
                FAQ
              </a>
              <div className="flex flex-col gap-2 mt-3">
                <Link
                  to="/auth/login"
                  className="text-sm font-medium text-center text-gray-700 border border-gray-300 py-2.5 rounded-lg"
                >
                  Connexion
                </Link>
                <Link
                  to="/auth/register"
                  className="text-sm font-medium text-center bg-primary text-white py-2.5 rounded-lg"
                >
                  Devenir affilié
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}