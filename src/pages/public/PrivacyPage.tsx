// pages/PrivacyPage.tsx
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  UserCheck, 
  FileText,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import PublicLayout from '../../layouts/public/PublicLayout';

export default function PrivacyPage() {
  const sections = [
    {
      title: "Collecte des données",
      icon: <Database className="h-6 w-6" />,
      description: "Nous collectons les informations nécessaires au fonctionnement de la plateforme.",
      items: [
        "Nom, Prénom",
        "Numéro de téléphone",
        "Adresse physique (pour les vendeurs)",
        "Pièce d'identité valide (processus KYC)",
        "Informations de paiement"
      ]
    },
    {
      title: "Utilisation des données",
      icon: <UserCheck className="h-6 w-6" />,
      description: "Vos données sont utilisées pour :",
      items: [
        "Valider votre compte (KYC)",
        "Traiter vos commandes",
        "Vous envoyer les notifications",
        "Améliorer nos services",
        "Respecter nos obligations légales"
      ]
    },
    {
      title: "Protection des données",
      icon: <Lock className="h-6 w-6" />,
      description: "Nous protégeons vos données avec :",
      items: [
        "Chiffrement des données sensibles",
        "Sécurisation des transactions",
        "Accès restreint aux données personnelles",
        "Audits de sécurité réguliers"
      ]
    },
    {
      title: "Partage des données",
      icon: <Eye className="h-6 w-6" />,
      description: "Nous partageons vos données uniquement :",
      items: [
        "Avec notre partenaire Pawapay pour les paiements",
        "Avec les vendeurs pour le traitement des commandes",
        "Si la loi nous y oblige",
        "Avec votre consentement explicite"
      ]
    },
    {
      title: "Conservation des données",
      icon: <Database className="h-6 w-6" />,
      description: "Vos données sont conservées :",
      items: [
        "Pendant la durée de votre compte actif",
        "5 ans après la fermeture du compte (obligations légales)",
        "Vous pouvez demander la suppression de vos données"
      ]
    },
    {
      title: "Vos droits",
      icon: <UserCheck className="h-6 w-6" />,
      description: "Vous avez le droit de :",
      items: [
        "Accéder à vos données",
        "Rectifier vos données",
        "Supprimer vos données",
        "Limiter le traitement de vos données",
        "Retirer votre consentement à tout moment"
      ]
    }
  ];

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <div className="relative bg-primary text-white py-16">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-16 w-16" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Politique de confidentialité
            </h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              Protéger vos données personnelles est notre priorité
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Introduction */}
          <div className="bg-white rounded-xl border p-6 mb-8">
            <p className="text-gray-600 leading-relaxed">
              Chez <span className="font-bold text-primary">Cabunets</span>, nous accordons une importance capitale à la protection 
              de vos données personnelles. Cette politique de confidentialité vous informe sur la manière 
              dont nous collectons, utilisons, partageons et protégeons vos informations.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <RefreshCw className="h-4 w-4" />
              <span>Dernière mise à jour : Août 2026</span>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div key={index} className="bg-white rounded-xl border p-6 hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {section.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {section.title}
                  </h3>
                </div>
                <p className="text-gray-600 mb-3">
                  {section.description}
                </p>
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Sécurité */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-start gap-4">
              <Shield className="h-8 w-8 text-blue-600 shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Engagement de sécurité</h3>
                <p className="text-gray-700 text-sm mt-1">
                  Nous nous engageons à protéger vos données personnelles avec les plus hauts standards de sécurité. 
                  Toutes les transactions sont sécurisées et vos informations sont traitées avec la plus grande confidentialité.
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-8 bg-white rounded-xl border p-6 text-center">
            <p className="text-gray-600 text-sm">
              Pour toute question concernant notre politique de confidentialité,
              <br />
              <a href="/contact" className="text-primary font-medium hover:underline">
                contactez-nous
              </a>
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}