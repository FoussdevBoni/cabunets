// src/pages/auth/RegisterPage.tsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  ArrowLeft,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../../hooks/auth/useAuth";
import { authService } from "../../services/authService";

type Step = "account" | "profile";

export default function RegisterPage() {
  // Étape 1 : compte
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Étape 2 : profil
  const [username, setUsername] = useState("");
  const [telephone, setTelephone] = useState("");

  // Code de parrainage (optionnel)
  const [referralCode, setReferralCode] = useState("");

  // État
  const [step, setStep] = useState<Step>("account");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { authenticate } = useAuth();
  const navigate = useNavigate();

  // ============================================================
  // ÉTAPE 1 → ÉTAPE 2
  // ============================================================
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setStep("profile");
  };

  // ============================================================
  // SOUMISSION FINALE
  // ============================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!telephone.trim()) {
      setError("Veuillez renseigner votre téléphone");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        email,
        password,
        username,
        telephone,
        becomeAffiliate: true,
        referralCode: referralCode || undefined,
      });

      if (response.token) {
        await authenticate(response.token);
        navigate("/redirect");
      } else {
        // Inscription sans token (email à confirmer)
        navigate("/auth/login");
      }
    } catch (err: any) {
      console.error("Erreur d'inscription:", err);
      setError(authService.getAuthError(err));
      setStep("account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => navigate("/")}
            >
              <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            </div>

            <div className="flex items-center gap-4">
              <p className="text-gray-600 text-sm hidden sm:block">
                Déjà un compte?
              </p>
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-2 border border-primary text-primary px-5 py-2.5 rounded-lg font-medium hover:bg-primary/5 transition"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {/* En-tête */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Devenir affilié
              </h2>
              <p className="mt-2 text-gray-600">
                {step === "account"
                  ? "Créez votre compte en 2 minutes"
                  : "Complétez votre profil"}
              </p>

              {/* Indicateur d'étapes */}
              <div className="flex items-center justify-center gap-2 mt-6">
                <div
                  className={`h-1.5 w-12 rounded-full ${
                    step === "account" ? "bg-primary" : "bg-primary/30"
                  }`}
                />
                <div
                  className={`h-1.5 w-12 rounded-full ${
                    step === "profile" ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* ÉTAPE 1 : Compte */}
            {step === "account" && (
              <form onSubmit={handleNextStep} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                      placeholder="vous@exemple.com"
                    />
                  </div>
                </div>

                {/* Mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirmation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* Code de parrainage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code de parrainage{" "}
                    <span className="text-gray-400 font-normal">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition uppercase"
                    placeholder="AFF-XXXXXX"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Si un ami vous a parrainé, entrez son code ici.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-white py-3.5 px-4 rounded-lg font-medium hover:bg-primary/90 transition"
                >
                  Continuer
                </button>
              </form>
            )}

            {/* ÉTAPE 2 : Profil */}
            {step === "profile" && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nom d'utilisateur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom d'utilisateur{" "}
                    <span className="text-gray-400 font-normal">(optionnel)</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                      placeholder="votre_pseudo"
                    />
                  </div>
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                      placeholder="+243 XXX XXX XXX"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">
                    Utile pour recevoir vos paiements Mobile Money.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("account")}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-3.5 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Retour
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary text-white py-3.5 px-4 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Inscription...
                      </div>
                    ) : (
                      "Créer mon compte"
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Lien connexion */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-center text-gray-600 text-sm">
                Déjà un compte?{" "}
                <Link
                  to="/auth/login"
                  className="text-primary font-medium hover:text-primary/80 transition"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </div>

          {/* Mentions légales */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              En créant un compte, vous acceptez nos{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Conditions d'utilisation
              </Link>{" "}
              et notre{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Politique de confidentialité
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} CabuAffili. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}