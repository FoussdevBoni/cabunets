// pages/TermsPage.tsx - Version corrigée
import { useState } from 'react';
import { 
  Shield, 
  FileText, 
  Users, 
  Clock, 
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Store,
  Smartphone,
  CreditCard,
  RefreshCw,
  Scale,
  Gavel,
  Zap,
  ShoppingBag
} from 'lucide-react';
import PublicLayout from '../../layouts/public/PublicLayout';

export default function TermsPage() {
  // ✅ Utiliser une string comme clé au lieu de number
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setOpenSection(openSection === sectionId ? null : sectionId);
  };

  // Sections pour Vendeurs
  const sellerSections = [
    {
      id: 'seller-1',
      title: "Inscription et Compte Vendeur",
      icon: <Users className="h-5 w-5" />,
      content: [
        "Fournir des informations exactes (Nom, Prénom, Numéro de téléphone, adresse physique, pièce d'identité valide) pour valider votre compte (processus KYC).",
        "Utiliser un compte WhatsApp valide pour recevoir les notifications de commandes. Vous vous engagez à répondre aux notifications dans un délai raisonnable.",
        "Être le propriétaire légal des stocks d'unités que vous proposez à la vente."
      ]
    },
    {
      id: 'seller-2',
      title: "Gestion des Offres et des Stocks",
      icon: <Store className="h-5 w-5" />,
      content: [
        "Vous êtes libre de fixer vos prix de vente au détail sur l'interface.",
        "Vous vous engagez à publier uniquement des offres réelles et à maintenir à jour les prix, les quantités disponibles.",
        "En cas de rupture de stock, vous devez immédiatement désactiver l'offre pour éviter les commandes que vous ne pourriez pas honorer."
      ]
    },
    {
      id: 'seller-3',
      title: "Traitement et Livraison des Commandes",
      icon: <Zap className="h-5 w-5" />,
      content: [
        "Délai maximum de 5 à 10 minutes pour envoyer les unités puis confirmer l'envoi dans votre tableau de bord.",
        "Le vendeur garantit que les unités vendues sont valides et disponibles.",
        "Toute tentative de fraude ou de livraison incomplète pourra entraîner la suspension ou la suppression définitive du compte.",
        "En cas d'impossibilité, vous devez informer immédiatement le support Cabunets."
      ]
    },
    {
      id: 'seller-4',
      title: "Frais de service et Règlement financier",
      icon: <CreditCard className="h-5 w-5" />,
      content: [
        "Commission Cabunets : 0,45% sur le montant de la vente.",
        "Paiement vers votre numéro mobile enregistré sous 24h ou 48h ouvrées.",
        "Les retraits ne sont pas effectués sur des comptes dont l'identité n'a pas été vérifiée à 100%."
      ]
    },
    {
      id: 'seller-5',
      title: "Garantie et Litiges",
      icon: <Scale className="h-5 w-5" />,
      content: [
        "Toute tentative de fraude entraînera la suspension immédiate de votre compte et le blocage de vos fonds.",
        "Vous vous engagez à collaborer avec le support Cabunets en cas de litige.",
        "La décision de Cabunets concernant le remboursement est sans appel."
      ]
    },
    {
      id: 'seller-6',
      title: "Résiliation du contrat",
      icon: <Gavel className="h-5 w-5" />,
      content: [
        "Le Vendeur peut fermer son compte à tout moment via son tableau de bord.",
        "Cabunets se réserve le droit de suspendre ou de résilier le compte sans préavis en cas de manquement grave."
      ]
    }
  ];

  // Sections pour Clients
  const clientSections = [
    {
      id: 'client-1',
      title: "Inscription et Utilisation du Compte",
      icon: <Users className="h-5 w-5" />,
      content: [
        "Vous devez créer un compte Client en fournissant des informations exactes.",
        "Vous êtes seul responsable de la confidentialité de vos identifiants de connexion.",
        "Toute commande passée via votre compte sera considérée comme ayant été effectuée par vous."
      ]
    },
    {
      id: 'client-2',
      title: "Processus de Commande",
      icon: <ShoppingBag className="h-5 w-5" />,
      content: [
        "Les prix sont déterminés librement par les marchands de gros.",
        "En validant votre achat, vous passez une commande ferme.",
        "Vous recevrez un récapitulatif de votre transaction (ticket de caisse numérique)."
      ]
    },
    {
      id: 'client-3',
      title: "Modes de Paiement et Sécurité",
      icon: <Shield className="h-5 w-5" />,
      content: [
        "Paiements via Mobile Money (M-PESA, Orange Money, Airtel Money, etc.).",
        "Tous les paiements sont sécurisés.",
        "Cabunets conserve les fonds en garantie jusqu'à la livraison (principe de séquestre / escrow)."
      ]
    },
    {
      id: 'client-4',
      title: "Livraison des Unités",
      icon: <Smartphone className="h-5 w-5" />,
      content: [
        "Délai de livraison : 5 à 10 minutes maximum après validation du paiement.",
        "Les unités sont envoyées directement sur votre interface."
      ]
    },
    {
      id: 'client-5',
      title: "Politique de Remboursement",
      icon: <RefreshCw className="h-5 w-5" />,
      content: [
        "Garantie de remboursement en cas de plainte effectuée dans les 24 heures."
      ]
    },
    {
      id: 'client-6',
      title: "Responsabilités",
      icon: <AlertCircle className="h-5 w-5" />,
      content: [
        "Cabunets agit en tant qu'intermédiaire technique de confiance.",
        "Cabunets décline toute responsabilité concernant les problèmes techniques des opérateurs tiers.",
        "Une fois le code PIN valide envoyé, le transfert de propriété est effectif."
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Conditions d'utilisation
            </h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              En utilisant Cabunets, vous acceptez nos conditions générales
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 inline-flex">
              <FileText className="h-4 w-4" />
              <span>Dernière mise à jour : Août 2026</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Alert */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-medium text-yellow-800">Acceptation des conditions</span>
              <p className="text-yellow-700 text-sm mt-1">
                En cliquant sur le bouton "J'accepte" ou en validant votre première commande sur la plateforme Cabunets, 
                vous reconnaissez avoir lu, compris et accepté sans réserve l'intégralité des présentes Conditions Générales.
              </p>
            </div>
          </div>

          {/* Table des matières */}
          <div className="bg-white rounded-xl border p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">📑 Table des matières</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="font-semibold text-primary mb-2">Pour les Vendeurs</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  {sellerSections.map((section) => (
                    <li key={section.id}>
                      <a href={`#${section.id}`} className="hover:text-primary transition">
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-primary mb-2">Pour les Clients</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  {clientSections.map((section) => (
                    <li key={section.id}>
                      <a href={`#${section.id}`} className="hover:text-primary transition">
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section Vendeurs */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Conditions pour les Vendeurs
              </h2>
            </div>

            <div className="space-y-4">
              {sellerSections.map((section) => (
                <div
                  key={section.id}
                  id={section.id}
                  className="bg-white rounded-xl border overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-primary">{section.icon}</div>
                      <span className="font-semibold text-gray-900">
                        {section.title}
                      </span>
                    </div>
                    {openSection === section.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {openSection === section.id && (
                    <div className="px-6 pb-4">
                      <ul className="space-y-2 text-gray-600">
                        {section.content.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section Clients */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Conditions pour les Clients
              </h2>
            </div>

            <div className="space-y-4">
              {clientSections.map((section) => (
                <div
                  key={section.id}
                  id={section.id}
                  className="bg-white rounded-xl border overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-primary">{section.icon}</div>
                      <span className="font-semibold text-gray-900">
                        {section.title}
                      </span>
                    </div>
                    {openSection === section.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {openSection === section.id && (
                    <div className="px-6 pb-4">
                      <ul className="space-y-2 text-gray-600">
                        {section.content.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Résumé */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold text-gray-900">Résumé</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-medium text-gray-900 text-sm">Sécurisé</p>
                <p className="text-gray-500 text-xs">Transactions 100% sécurisées</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-medium text-gray-900 text-sm">Rapide</p>
                <p className="text-gray-500 text-xs">Livraison en 5-10 minutes</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-medium text-gray-900 text-sm">Fiable</p>
                <p className="text-gray-500 text-xs">Vendeurs vérifiés</p>
              </div>
            </div>
          </div>

          {/* Acceptation */}
          <div className="mt-8 bg-white rounded-xl border p-6 text-center">
            <p className="text-gray-600 text-sm">
              <span className="font-bold text-gray-900">Dernière mise à jour :</span> Août 2026
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Cabunets peut mettre à jour les présentes conditions afin d'améliorer ses services. 
              Les vendeurs seront informés des modifications importantes.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}