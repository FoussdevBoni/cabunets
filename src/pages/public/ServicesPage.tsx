import { 
  ShoppingBag, 
  Shield, 
  Zap, 
  Users, 
  TrendingUp,
  CheckCircle,
  BarChart3,
  MessageSquare,
  Target
} from 'lucide-react'
import PublicLayout from '../../layouts/public/PublicLayout'

export default function ServicesPage() {
  const mainServices = [
    {
      icon: <ShoppingBag className="h-10 w-10" />,
      title: "Marché de gros B2B",
      description: "Plateforme dédiée aux transactions d'unités de gros entre professionnels.",
      features: ["Vendeurs vérifiés", "Offres compétitives", "Transactions sécurisées"]
    },
    {
      icon: <Users className="h-10 w-10" />,
      title: "Mise en relation directe",
      description: "Connectez-vous directement avec les vendeurs via WhatsApp pour des négociations rapides.",
      features: ["Contact direct", "Négociation en temps réel", "Communication personnalisée"]
    },
    {
      icon: <Shield className="h-10 w-10" />,
      title: "Sécurité des transactions",
      description: "Supervision et suivi des échanges pour garantir la confiance entre les parties.",
      features: ["Vendeurs certifiés", "Supervision active", "Support transactionnel"]
    }
  ]

  const forSellers = [
    {
      title: "Visibilité accrue",
      description: "Exposez vos offres à des milliers de clients potentiels."
    },
    {
      title: "Gestion simplifiée",
      description: "Interface intuitive pour gérer vos offres et commandes."
    },
    {
      title: "Croissance garantie",
      description: "Augmentez votre chiffre d'affaires avec notre réseau étendu."
    }
  ]

  const forBuyers = [
    {
      title: "Choix variés",
      description: "Accédez à un large catalogue d'offres de différents vendeurs."
    },
    {
      title: "Meilleurs prix",
      description: "Comparez et trouvez les offres les plus compétitives du marché."
    },
    {
      title: "Confiance totale",
      description: "Achetez en toute sécurité auprès de vendeurs vérifiés."
    }
  ]

  const workflow = [
    {
      step: "01",
      title: "Inscription",
      description: "Les vendeurs créent leur profil et publient leurs offres."
    },
    {
      step: "02",
      title: "Recherche",
      description: "Les clients explorent et comparent les offres disponibles."
    },
    {
      step: "03",
      title: "Connexion",
      description: "Contact direct via WhatsApp pour négocier et finaliser."
    },
    {
      step: "04",
      title: "Transaction",
      description: "Échange sécurisé supervisé par notre plateforme."
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
              Nos Services
            </h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              Une plateforme complète pour les transactions d'unités de gros entre professionnels
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Services principaux */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
                <Target className="h-5 w-5" />
                <span className="font-medium">Notre expertise</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Ce que nous offrons
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {mainServices.map((service, index) => (
                <div key={index} className="bg-white rounded-xl border p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="text-primary mb-6">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Pour les vendeurs */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 md:p-12 mb-16">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full mb-4">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">Pour les vendeurs</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Boostez votre activité
                </h3>
                <p className="text-gray-700">
                  Développez votre entreprise avec notre plateforme conçue pour les professionnels du gros.
                </p>
              </div>
              
              <div className="md:w-2/3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {forSellers.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-6 border">
                      <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pour les acheteurs */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12 mb-16">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full mb-4">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="font-medium">Pour les acheteurs</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Trouvez les meilleures offres
                </h3>
                <p className="text-gray-700">
                  Accédez à un marché de gros compétitif et fiable pour vos besoins professionnels.
                </p>
              </div>
              
              <div className="md:w-2/3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {forBuyers.map((item, index) => (
                    <div key={index} className="bg-white rounded-lg p-6 border">
                      <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Workflow */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Comment ça fonctionne
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Un processus simple et efficace pour des transactions réussies
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {workflow.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-xl border p-6 text-center relative z-10">
                    <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold mx-auto mb-4">
                      {step.step}
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      {step.title}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {step.description}
                    </p>
                  </div>
                  
                  {index < workflow.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 right-0 w-full transform -translate-y-1/2 z-0">
                      <div className="h-0.5 bg-gray-200 ml-6 mr-6" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Avantages clés */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-white rounded-xl border p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div className="font-bold text-gray-900 mb-2">Rapidité</div>
              <p className="text-gray-600 text-sm">Transactions en temps réel</p>
            </div>
            
            <div className="bg-white rounded-xl border p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div className="font-bold text-gray-900 mb-2">Sécurité</div>
              <p className="text-gray-600 text-sm">Vendeurs vérifiés</p>
            </div>
            
            <div className="bg-white rounded-xl border p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="font-bold text-gray-900 mb-2">Transparence</div>
              <p className="text-gray-600 text-sm">Prix et conditions clairs</p>
            </div>
            
            <div className="bg-white rounded-xl border p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div className="font-bold text-gray-900 mb-2">Support</div>
              <p className="text-gray-600 text-sm">Assistance 24/7</p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Prêt à commencer ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Rejoignez notre communauté de professionnels et transformez votre façon de faire des affaires.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/vendeur-register"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition text-lg"
              >
                <TrendingUp className="h-5 w-5" />
                Devenir vendeur
              </a>
              <a
                href="/offres"
                className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary px-8 py-3 rounded-lg font-bold hover:bg-primary/10 transition text-lg"
              >
                <ShoppingBag className="h-5 w-5" />
                Explorer les offres
              </a>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}