import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare,
  Globe,
  Shield,
  Users
} from 'lucide-react'
import PublicLayout from '../../layouts/public/PublicLayout'

export default function ContactPage() {
  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      details: "support@cabunets.com",
      description: "Pour toute question générale",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Téléphone",
      details: "+243 XX XXX XXXX",
      description: "Support technique",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "WhatsApp",
      details: "+243 XX XXX XXXX",
      description: "Support en direct",
      color: "bg-green-100 text-green-600"
    }
  ]

  const businessHours = [
    { day: "Lundi - Vendredi", hours: "8h00 - 18h00" },
    { day: "Samedi", hours: "9h00 - 16h00" },
    { day: "Dimanche", hours: "Support technique uniquement" }
  ]

  const faqs = [
    {
      question: "Comment devenir vendeur sur Cabunets ?",
      answer: "Cliquez sur 'Devenir vendeur' dans le menu et remplissez le formulaire d'inscription."
    },
    {
      question: "Comment contacter un vendeur ?",
      answer: "Cliquez sur le bouton WhatsApp de la fiche du vendeur pour le contacter directement."
    },
    {
      question: "La plateforme est-elle sécurisée ?",
      answer: "Oui, tous les vendeurs sont vérifiés et les transactions sont supervisées par Cabukaka."
    },
    {
      question: "Y a-t-il des frais pour les clients ?",
      answer: "Non, l'utilisation de la plateforme est gratuite pour les acheteurs."
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
              Contactez-nous
            </h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              Nous sommes là pour vous aider. Trouvez ci-dessous toutes les façons de nous contacter.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Méthodes de contact */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Nos canaux de contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {contactMethods.map((method, index) => (
                <div key={index} className="bg-white rounded-xl border p-8 text-center hover:shadow-lg transition-shadow">
                  <div className={`h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-4 ${method.color}`}>
                    {method.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {method.title}
                  </h3>
                  <div className="text-lg font-medium text-gray-800 mb-2">
                    {method.details}
                  </div>
                  <p className="text-gray-600">
                    {method.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Horaires */}
            <div className="bg-white rounded-xl border p-8">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-bold text-gray-900">
                  Horaires d'ouverture
                </h3>
              </div>
              <div className="space-y-4">
                {businessHours.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b last:border-0">
                    <span className="font-medium text-gray-700">{item.day}</span>
                    <span className="text-gray-900 font-semibold">{item.hours}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-900 mb-1">Support 24/7</div>
                    <p className="text-blue-700 text-sm">
                      Notre support technique est disponible 24h/24 pour les urgences.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-xl border p-8">
              <div className="flex items-center gap-3 mb-6">
                <Users className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-bold text-gray-900">
                  Questions fréquentes
                </h3>
              </div>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b pb-6 last:border-0 last:pb-0">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      {faq.question}
                    </h4>
                    <p className="text-gray-600">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Écosystème Cabukaka */}
          <div className="bg-gradient-to-r from-primary to-primary/90 text-white rounded-2xl p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="md:w-2/3">
                  <h3 className="text-2xl font-bold mb-4">
                    Faites partie de l'écosystème Cabukaka
                  </h3>
                  <p className="opacity-90">
                    Cabunets est soutenu par la technologie et l'expertise de Cabukaka, 
                    garantissant une expérience sécurisée et fiable pour tous vos échanges commerciaux.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-center">
                    <Globe className="h-10 w-10 mx-auto mb-3" />
                    <div className="font-bold text-xl">Cabukaka</div>
                    <div className="text-sm opacity-80">Écosystème de services</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Adresse (optionnelle) */}
          <div className="mt-16 bg-white rounded-xl border p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/3 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Notre présence</h3>
              </div>
              <div className="md:w-2/3">
                <div className="text-center md:text-left">
                  <p className="text-gray-700 mb-4">
                    <span className="font-bold">Cabunets</span> opère à travers toute la RDC, 
                    connectant vendeurs et acheteurs partout dans le pays grâce à notre plateforme digitale.
                  </p>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                    <Globe className="h-5 w-5" />
                    <span>Plateforme 100% digitale - Accessible partout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}