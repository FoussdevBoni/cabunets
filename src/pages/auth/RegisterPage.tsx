import { captureReferral, setReferralCode } from "../../utils/referral";
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Store, ShoppingBag, UserIcon, LogOut, ArrowRight } from "lucide-react"
import { useAuth } from "../../hooks/auth/useAuth"
import VendeurRegisterForm from "../../components/features/auth/VendeurRegisterForm"
import AcheteurRegisterForm from "../../components/features/auth/AcheteurRegisterForm"

type TabType = 'acheteur' | 'vendeur'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [referral, setReferral] = useState(() => captureReferral() ?? "");
  const [activeTab, setActiveTab] = useState<TabType>('acheteur')

  // Si l'utilisateur est déjà connecté
  if (user) {
    const isVendeur = user.role === 'vendeur'
    const dashboardPath = isVendeur ? '/vendeur/overview' : '/client/dashboard'

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <UserIcon className="h-12 w-12 text-primary" />
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.username}</h2>
          <p className="text-gray-500 text-sm mb-6">{user.email}</p>

          <div className="space-y-3">
            <button
              onClick={() => navigate(dashboardPath)}
              className="w-full bg-primary text-white px-4 py-3 rounded-xl font-medium hover:bg-primary/90 transition flex items-center justify-center gap-2"
            >
              <ArrowRight className="h-5 w-5" />
              Accéder au tableau de bord
            </button>

            <button
              onClick={async () => {
                await logout()
                navigate('/login')
              }}
              className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <LogOut className="h-5 w-5" />
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 group"
              aria-label="Retour"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-gray-900" />
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 hidden sm:inline">
                Retour
              </span>
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">Inscription</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header du formulaire */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Créer un <span className="text-primary">compte</span>
          </h2>
          <p className="mt-2 text-gray-600">
            Choisissez le type de compte que vous souhaitez créer
          </p>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-8">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('acheteur')}
              className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'acheteur'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Acheteur</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('vendeur')}
              className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'vendeur'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Store className="h-5 w-5" />
              <span>Vendeur</span>
            </button>
          </div>
        </div>

        {/* Description dynamique */}
        <div className="text-center mb-6">
          {activeTab === 'acheteur' ? (
            <p className="text-gray-600">
              Inscrivez-vous pour acheter des unités de recharge auprès de nos vendeurs
            </p>
          ) : (
            <p className="text-gray-600">
              Inscrivez-vous pour vendre des unités de recharge et développer votre activité
            </p>
          )}
        </div>

        <div className="mb-5">
          <label htmlFor="referral-code" className="block text-sm font-medium mb-2">Code de parrainage (optionnel)</label>
          <input id="referral-code" className="w-full rounded-lg border-gray-300 uppercase" value={referral} maxLength={20}
            onChange={event => { const value = event.target.value.toUpperCase(); setReferral(value); setReferralCode(value); }} />
          <p className="text-xs text-gray-500 mt-1">Vérifiez ce code avant de créer votre compte. Vous pouvez le corriger ou le retirer.</p>
        </div>
        {/* Formulaire actif */}
        {activeTab === 'acheteur' ? <AcheteurRegisterForm /> : <VendeurRegisterForm />}
      </div>
    </div>
  )
}