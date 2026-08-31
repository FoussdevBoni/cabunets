import React, { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { 
  Search, 
  Loader2, 
  Copy, 
  Check, 
  Terminal, 
  AlertCircle,
  Code2,
  ArrowLeft,
  RefreshCw
} from "lucide-react"

import { ordersService } from "../../hooks/orders/useOrders"

// Interfaces DTO Pawapay / Cabupay
export interface AccountDetails {
  phoneNumber: string;
  provider: string;
}

export interface Payer {
  type: string;
  accountDetails: AccountDetails;
}

export interface FailureReason {
  failureMessage: string;
  failureCode: string;
}

export interface DepositData {
  depositId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | string;
  amount: string;
  currency: string;
  country: string;
  payer?: Payer;
  customerMessage?: string;
  created?: string;
  failureReason?: FailureReason;
  [key: string]: any; // Permet de capturer toute autre propriété dynamique du JSON
}

export interface DepositResponse {
  data?: DepositData;
  status: 'NOT_FOUND' | 'FOUND' | string;
}

export default function AdminDepositLookupPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const initialDepositId = searchParams.get("depositId") || ""

  const [inputDepositId, setInputDepositId] = useState(initialDepositId)
  const [depositResponse, setDepositResponse] = useState<DepositResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Token d'authentification
  const token = localStorage.getItem("token") || ""

  const fetchDeposit = async (id: string) => {
    const cleanId = id.trim()
    if (!cleanId) return

    setLoading(true)
    setError(null)

    try {
      const response: DepositResponse = await ordersService.getDeposit(token, cleanId)
      
      if (!response) {
        throw new Error("Réponse vide du serveur.")
      }

      setDepositResponse(response)
    } catch (err: any) {
      console.error("Erreur fetch deposit admin:", err)
      setError(err?.message || "Erreur lors de la récupération du dépôt.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialDepositId) {
      fetchDeposit(initialDepositId)
    }
  }, [initialDepositId])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputDepositId.trim()) return
    setSearchParams({ depositId: inputDepositId.trim() })
    fetchDeposit(inputDepositId.trim())
  }

  const handleCopyJson = () => {
    if (!depositResponse) return
    navigator.clipboard.writeText(JSON.stringify(depositResponse, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Protection contre les erreurs undefined/null sur status
  const renderStatusBadge = (status?: string) => {
    const safeStatus = (status || "UNKNOWN").toUpperCase()
    
    let colorClasses = "bg-gray-800 text-gray-300 border-gray-700"
    if (safeStatus === "COMPLETED" || safeStatus === "SUCCESSFUL") {
      colorClasses = "bg-emerald-950 text-emerald-400 border-emerald-800"
    } else if (safeStatus === "PENDING" || safeStatus === "PROCESSING" || safeStatus === "ACCEPTED") {
      colorClasses = "bg-amber-950 text-amber-400 border-amber-800"
    } else if (safeStatus === "FAILED" || safeStatus === "REJECTED") {
      colorClasses = "bg-rose-950 text-rose-400 border-rose-800"
    }

    return (
      <span className={`px-2.5 py-1 rounded border font-mono text-xs font-semibold ${colorClasses}`}>
        {safeStatus}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation & Header Admin */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white transition"
              title="Retour"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2 text-white">
                <Terminal className="w-5 h-5 text-indigo-400" />
                Admin Inspector : Dépôt
              </h1>
              <p className="text-xs text-gray-400">
                Outil d'inspection JSON brut pour la mise au point et le support technique.
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire de recherche ID */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Saisir le depositId (Ex: 8a2d4f10-...)"
              value={inputDepositId}
              onChange={(e) => setInputDepositId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm font-mono text-gray-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !inputDepositId.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Inspecter
          </button>
        </form>

        {/* Loading state */}
        {loading && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
            <Loader2 className="h-8 w-8 text-indigo-400 animate-spin mx-auto mb-3" />
            <p className="text-gray-400 font-mono text-sm">Requête en cours vers `ordersService.getDeposit`...</p>
          </div>
        )}

        {/* Message d'erreur */}
        {error && !loading && (
          <div className="bg-rose-950/40 border border-rose-900 p-4 rounded-xl flex items-start gap-3 text-rose-200 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-rose-300">Erreur lors de l'inspection</span>
              <p className="text-xs text-rose-300/80 mt-1 font-mono">{error}</p>
            </div>
          </div>
        )}

        {/* Affichage JSON Technique */}
        {depositResponse && !loading && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
            
            {/* Header de la réponse */}
            <div className="bg-gray-900/80 border-b border-gray-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Code2 className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-mono text-gray-400">
                  HTTP Payload Response
                </span>
                {renderStatusBadge(depositResponse?.data?.status || depositResponse?.status)}
              </div>

              <button
                onClick={handleCopyJson}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 px-3 py-1.5 rounded-lg text-xs font-mono transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                    <span>Copier JSON</span>
                  </>
                )}
              </button>
            </div>

            {/* Viewer JSON brut */}
            <div className="p-6 overflow-x-auto bg-black/50">
              <pre className="font-mono text-xs text-emerald-400 leading-relaxed selection:bg-indigo-900 selection:text-white">
                <code>{JSON.stringify(depositResponse, null, 2)}</code>
              </pre>
            </div>

            {/* Footer d'information rapide */}
            <div className="border-t border-gray-800 px-6 py-3 bg-gray-900/40 flex justify-between items-center text-[11px] font-mono text-gray-500">
              <span>Deposit ID: {depositResponse?.data?.depositId || "N/A"}</span>
              <span>Response Status: {depositResponse?.status}</span>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}