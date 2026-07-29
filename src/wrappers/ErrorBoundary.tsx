// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, RefreshCw, AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary:', error)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}

function ErrorFallback() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        {/* Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>

        {/* Titre */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Oups ! Une erreur est survenue
        </h2>
        
        <p className="text-gray-600 text-center mb-8">
          Nous rencontrons un problème technique. 
          L'équipe a été informée.
        </p>

        {/* Boutons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              navigate('/')
              window.location.reload()
            }}
            className="w-full bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition flex items-center justify-center gap-2 font-medium"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2 font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            Réessayer
          </button>
        </div>
      </div>
    </div>
  )
}