import { 
  Users, 
  Shield, 
  Zap, 
  Target, 
  Globe,
  ArrowRight
} from 'lucide-react'
import PublicLayout from '../../layouts/public/PublicLayout'

export default function AboutPage() {
  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Transaction sécurisée",
      description: "Toutes les transactions sont supervisées et sécurisées pour garantir la confiance entre vendeurs et acheteurs."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Rapidité",
      description: "Mise en relation instantanée avec les meilleurs vendeurs disponibles 24h/24."
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Fiabilité",
      description: "Vendeurs vérifiés et notés pour assurer une expérience client optimale."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Communauté",
      description: "Une plateforme qui connecte une communauté grandissante de professionnels."
    }
  ]

  const howItWorks = [
    {
      step: "1",
      title: "Inscription",
      description: "Les vendeurs s'inscrivent et créent leur profil avec leurs offres de gros."
    },
    {
      step: "2",
      title: "Publication",
      description: "Les vendeurs publient leurs offres d'unités avec prix et conditions claires."
    },
    {
      step: "3",
      title: "Recherche",
      description: "Les clients recherchent et comparent les offres disponibles."
    },
    {
      step: "4",
      title: "Transaction",
      description: "Contact direct via WhatsApp pour finaliser la transaction en toute confiance."
    }
  ]

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <div className="relative bg-primary text-white py-20">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              À propos de <span className="text-yellow-300">Cabunets</span>
            </h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              La plateforme qui révolutionne l'achat d'unités de gros en mettant en relation 
              directe les vendeurs professionnels et leurs clients.
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Globe className="h-5 w-5" />
              <span className="font-medium">Service Cabukaka</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Notre mission
            </h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-gray-700 mb-6">
                <span className="font-bold text-primary">Cabunets</span> est le deuxième service innovant de 
                la famille <span className="font-bold">Cabukaka</span>, spécialement conçu pour les transactions 
                d'unités de gros entre professionnels.
              </p>
              <p className="text-lg text-gray-700">
                Nous simplifions et sécurisons les échanges commerciaux en créant un environnement 
                de confiance où les vendeurs peuvent exposer leurs offres et les clients trouver 
                les meilleures opportunités du marché.
              </p>
            </div>
          </div>

          {/* Comment ça marche */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Comment ça marche
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((item) => (
                <div key={item.step} className="bg-white rounded-xl border p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Nos avantages */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Pourquoi choisir Cabunets ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl border p-8 hover:shadow-lg transition-shadow">
                  <div className="text-primary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Services Cabukaka */}
          <div className="bg-gradient-to-r from-primary to-primary/90 text-white rounded-2xl p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">
                Une famille de services
              </h2>
              <p className="text-xl mb-8 opacity-90">
                <span className="font-bold">Cabunets</span> fait partie de l'écosystème 
                <span className="font-bold text-yellow-300"> Cabukaka</span>, qui inclut également 
                notre service de paiement sécurisé pour compléter votre expérience transactionnelle.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="font-bold text-lg">Cabunets</div>
                  <div className="text-sm opacity-80">Marchands d'unités de gros</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="font-bold text-lg">Cabukaka Pay</div>
                  <div className="text-sm opacity-80">Service de paiement</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Rejoignez notre communauté
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Que vous soyez vendeur professionnel ou client à la recherche des meilleures offres, 
              Cabunets est la plateforme qu'il vous faut.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/vendeur-register"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition text-lg"
              >
                Devenir vendeur
                <ArrowRight className="h-5 w-5" />
              </a>
              <a
                href="/offres"
                className="inline-flex items-center gap-2 border-2 border-primary text-primary px-8 py-3 rounded-lg font-bold hover:bg-primary/10 transition text-lg"
              >
                Explorer les offres
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}