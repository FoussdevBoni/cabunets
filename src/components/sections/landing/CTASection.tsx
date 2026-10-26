// src/components/sections/CTASection.tsx

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Prêt à commencer à gagner ?
        </h2>
        <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
          Rejoignez CabuAffili gratuitement et recevez votre lien unique en
          quelques minutes.
        </p>
        <Link
          to="/auth/register"
          className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Devenir affilié
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}