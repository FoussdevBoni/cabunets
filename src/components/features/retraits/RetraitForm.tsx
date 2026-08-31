// components/retraits/RetraitForm.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Send, Loader2, Wallet } from "lucide-react";
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
  const [formData, setFormData] = useState({
    amount: "",
    methodPayment: {
      type: "Momo" as "Momo" | "Bank",
      number: "",
      intitule: "",
    },
  });

  useEffect(() => {
    if (user?.id) {
      getWallet(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    if (wallet) {
      setCheckingWallet(false);
    }
  }, [wallet]);

  useEffect(() => {
    if (retrait && isEdit) {
      setFormData({
        amount: retrait.amount.toString(),
        methodPayment: {
          type: retrait.methodPayment.type,
          number: retrait.methodPayment.number,
          intitule: retrait.methodPayment.intitule,
        },
      });
    }
  }, [retrait, isEdit]);

  const handleSubmit = async () => {
    const amount = parseFloat(formData.amount);

    if (!amount || amount <= 0) {
      alertError("Le montant est obligatoire et doit être supérieur à 0");
      return;
    }

    // Vérifier que le montant ne dépasse pas le solde disponible
    if (wallet && amount > wallet.totalInDisplay.wallet) {
      alertError(`Solde insuffisant. Disponible: ${wallet.totalInDisplay.wallet} ${wallet.totalInDisplay.currency}`);
      return;
    }

    if (!formData.methodPayment.number.trim()) {
      alertError("Le numéro de paiement est obligatoire");
      return;
    }

    if (!formData.methodPayment.intitule.trim()) {
      alertError("Le nom du titulaire est obligatoire");
      return;
    }

    setLoading(true);
    try {
      let response;
      if (isEdit && retrait) {
        response = await retraitsService.update(
          retrait.id || retrait._id || "",
          {
            amount: amount,
            methodPayment: formData.methodPayment,
          },
          token
        );
      } else {
        response = await retraitsService.create(
          {
            vendeurId: user?.id!,
            amount: amount,
            methodPayment: formData.methodPayment,
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

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant à retirer <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Ex: 150000"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
              required
              disabled={loading}
            />
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
                className={`px-4 py-2.5 rounded-lg border-2 transition ${
                  formData.methodPayment.type === "Momo"
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
                  })
                }
                className={`px-4 py-2.5 rounded-lg border-2 transition ${
                  formData.methodPayment.type === "Bank"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                disabled={loading || isEdit}
              >
                Banque
              </button>
            </div>
          </div>

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