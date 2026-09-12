// components/retraits/RetraitForm.tsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X, Send, Loader2, Wallet, AlertTriangle } from "lucide-react";
import { alertSuccess, alertError } from "../../../helpers/alertError";
import useToken from "../../../hooks/auth/useToken";
import { retraitsService } from "../../../hooks/retraits/useRetraits";
import { Retrait } from "../../../types/Retrait";
import { useAuth } from "../../../hooks/auth/useAuth";
import useWallet from "../../../hooks/wallet/useWallet";

interface RetraitFormProps {
  retrait?: Retrait;
  isEdit?: boolean;
  onSuccess?: () => void;
}

export default function RetraitForm({ retrait, isEdit = false, onSuccess }: RetraitFormProps) {
  const navigate = useNavigate();
  const { token } = useToken();
  const { user } = useAuth();
  const { wallet, getWallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [checkingWallet, setCheckingWallet] = useState(true);
  const location = useLocation()
  const userData = location.state

  const currencies: ("CDF" | "USD")[] = ["CDF", "USD"];

  const providersRDC = [
    { name: "Airtel Money", value: "AIRTEL_COD" },
    { name: "M-Pesa (Vodacom)", value: "VODACOM_MPESA_COD" },
    { name: "Orange Money", value: "ORANGE_COD" },
  ];

  const [formData, setFormData] = useState({
    amount: "",
    currency: "CDF" as "CDF" | "USD",
    correspondent: "",
    methodPayment: {
      type: "Momo" as "Momo" | "Bank",
      number: "",
      intitule: "",
    },
  });
  const [confirmedNumber, setConfirmedNumber] = useState("");

  const userId = user?.role === "admin" ? userData.userId : (
    user?.role === "vendeur" ? user.id : null
  )

  useEffect(() => {
    if (userId) {
      getWallet(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (wallet) {
      setCheckingWallet(false);
    }
  }, [wallet]);

  useEffect(() => {
    if (retrait && isEdit) {
      setFormData({
        amount: retrait.amount.toString(),
        currency: (retrait as any).currency || "CDF",
        correspondent: (retrait as any).correspondent || "",
        methodPayment: {
          type: retrait.methodPayment.type,
          number: retrait.methodPayment.number,
          intitule: retrait.methodPayment.intitule,
        },
      });
      setConfirmedNumber(retrait.methodPayment.number);
    }
  }, [retrait, isEdit]);

  const handleSubmit = async () => {
    const amount = parseFloat(formData.amount);

    if (!amount || amount <= 0) {
      alertError("Le montant est obligatoire et doit être supérieur à 0");
      return;
    }

    if (wallet && amount > wallet.totalInDisplay.wallet) {
      alertError(`Solde insuffisant. Disponible: ${wallet.totalInDisplay.wallet} ${wallet.totalInDisplay.currency}`);
      return;
    }

    if (formData.methodPayment.type === "Momo" && !formData.correspondent.trim()) {
      alertError("Veuillez sélectionner un correspondant");
      return;
    }

    if (!formData.methodPayment.number.trim()) {
      alertError("Le numéro de paiement est obligatoire");
      return;
    }

    if (formData.methodPayment.number.trim() !== confirmedNumber.trim()) {
      alertError("Les numéros ne correspondent pas. Veuillez vérifier votre saisie.");
      return;
    }

    if (!formData.methodPayment.intitule.trim()) {
      alertError("Le nom du titulaire est obligatoire");
      return;
    }

    setLoading(true);
    try {
      let response;
      const payload: any = {
        amount: amount,
        currency: formData.currency,
        methodPayment: formData.methodPayment,
      };

      if (formData.methodPayment.type === "Momo") {
        payload.correspondent = formData.correspondent;
      }

      if (isEdit && retrait) {
        response = await retraitsService.update(
          retrait.id || retrait._id || "",
          payload,
          token
        );
      } else {
        response = await retraitsService.create(
          {
            vendeurId: userId!,
            ...payload,
            type: 'vendeur'
          },
          token
        );
      }

      if (response) {
        alertSuccess(
          isEdit
            ? "Retrait modifié avec succès"
            : "Demande de retrait soumise avec succès"
        );
        if (onSuccess) {
          onSuccess();
        } else {
          navigate("/vendeur/retraits");
        }
      }
    } catch (error: any) {
      console.error(error);
      alertError(error?.response?.data?.error || "Erreur lors de l'opération");
    } finally {
      setLoading(false);
    }
  };

  const numbersMatch = formData.methodPayment.number.trim() === confirmedNumber.trim();
  const showMismatch = confirmedNumber.length > 0 && !numbersMatch;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Solde disponible */}
      <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Solde disponible</p>
            {checkingWallet ? (
              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <p className="text-xl font-bold text-gray-900">
                {wallet?.totalInDisplay?.wallet?.toLocaleString() || 0} {wallet?.totalInDisplay?.currency || "CDF"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Avertissement global */}
      <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-700">
              Vérifiez attentivement votre numéro avant de valider
            </p>
            <p className="text-xs text-red-600 mt-1">
              Une fois le retrait envoyé, il est <strong>impossible de récupérer l'argent</strong> si le numéro est incorrect. Vérifiez chaque chiffre, deux fois.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-6">
          {/* Montant + Devise */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant à retirer <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Ex: 150000"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                required
                disabled={loading}
              />
              <select
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value as "CDF" | "USD" })
                }
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 bg-white"
                disabled={loading}
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
            {wallet && (
              <p className="text-xs text-gray-500 mt-1">
                Solde disponible: {wallet.totalInDisplay.wallet.toLocaleString()} {wallet.totalInDisplay.currency}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Méthode de paiement <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    methodPayment: { ...formData.methodPayment, type: "Momo" },
                  })
                }
                className={`px-4 py-2.5 rounded-lg border-2 transition ${formData.methodPayment.type === "Momo"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-300 hover:border-gray-400"
                  }`}
                disabled={loading || isEdit}
              >
                Mobile Money
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    methodPayment: { ...formData.methodPayment, type: "Bank" },
                    correspondent: "",
                  })
                }
                className={`px-4 py-2.5 rounded-lg border-2 transition ${formData.methodPayment.type === "Bank"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-300 hover:border-gray-400"
                  }`}
                disabled={loading || isEdit}
              >
                Banque
              </button>
            </div>
          </div>

          {formData.methodPayment.type === "Momo" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correspondant <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.correspondent}
                onChange={(e) =>
                  setFormData({ ...formData, correspondent: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 bg-white"
                required
                disabled={loading}
              >
                <option value="">-- Sélectionner un correspondant --</option>
                {providersRDC.map((provider) => (
                  <option key={provider.value} value={provider.value}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.methodPayment.type === "Momo" ? "Numéro de téléphone" : "Numéro de compte"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.methodPayment.number}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  methodPayment: { ...formData.methodPayment, number: e.target.value },
                })
              }
              placeholder={
                formData.methodPayment.type === "Momo"
                  ? "Ex: 90123456"
                  : "Ex: ECOBANK-123456789"
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
              required
              disabled={loading}
            />
          </div>

          {/* Champ de confirmation avec avertissement renforcé */}
          <div>
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs font-bold text-red-700 flex items-center gap-1">
                <AlertTriangle size={12} />
                ATTENTION : Vérifiez vraiment vraiment ce numéro. L'argent sera envoyé à ce numéro et ne pourra plus être récupéré.
              </p>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmez le {formData.methodPayment.type === "Momo" ? "numéro de téléphone" : "numéro de compte"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={confirmedNumber}
              onChange={(e) => setConfirmedNumber(e.target.value)}
              placeholder={
                formData.methodPayment.type === "Momo"
                  ? "Retapez le numéro de téléphone"
                  : "Retapez le numéro de compte"
              }
              className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-primary/50 ${
                showMismatch
                  ? "border-red-500 bg-red-50"
                  : confirmedNumber && numbersMatch
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300"
              }`}
              required
              disabled={loading}
            />
            {showMismatch && (
              <p className="text-xs text-red-600 font-bold mt-1 flex items-center gap-1">
                <AlertTriangle size={12} />
                Les numéros ne correspondent pas. Vérifiez votre saisie.
              </p>
            )}
            {confirmedNumber && numbersMatch && (
              <p className="text-xs text-green-600 font-medium mt-1">
                ✓ Les numéros correspondent
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du titulaire <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.methodPayment.intitule}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  methodPayment: { ...formData.methodPayment, intitule: e.target.value },
                })
              }
              placeholder="Ex: Jean Dupont"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
              required
              disabled={loading}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/vendeur/retraits")}
              className="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              disabled={loading}
            >
              <X size={18} />
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {isEdit ? "Modification..." : "Envoi..."}
                </>
              ) : (
                <>
                  <Send size={18} />
                  {isEdit ? "Modifier" : "Soumettre la demande"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}