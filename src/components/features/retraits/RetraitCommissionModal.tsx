// components/features/retraits/RetraitCommissionModal.tsx
import React, { useState, useEffect } from 'react';
import { AlertCircle, Banknote, Loader2, LogOut } from 'lucide-react';
import { BaseRetrait } from '../../../types/Retrait';
import BaseModal from '../../ui/Modal';
import { retraitsService } from '../../../hooks/retraits/useRetraits';
import useToken from '../../../hooks/auth/useToken';
import { alertError } from '../../../helpers/alertError';
import { getPawapayError } from '../../../utils/getPawapayErrors';


export interface RetraitCommissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => Promise<void> | void;
    montantDisponible: number;
    devise?: string;
    loading?: boolean;
    error?: string | null;
}

const providersRDC = [
    { name: "Airtel Money", value: "AIRTEL_COD" },
    { name: "M-Pesa (Vodacom)", value: "VODACOM_MPESA_COD" },
    { name: "Orange Money", value: "ORANGE_COD" },
];

const currencies: ("CDF" | "USD")[] = ["CDF", "USD"];

export default function RetraitCommissionModal({
    isOpen,
    onClose,
    onSuccess,
    montantDisponible,
    devise = 'CDF',
    loading = false,
    error = null,
}: RetraitCommissionModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const { token } = useToken()
    const [formData, setFormData] = useState<BaseRetrait>({
        amount: 0,
        type: "cabunet",
        currency: "CDF",
        correspondent: "",
        methodPayment: {
            type: "Momo",
            number: "",
            intitule: "",
        },
    });

    const [amountInput, setAmountInput] = useState<string>("");

    useEffect(() => {
        if (isOpen) {
            setLocalError(null);
            setSubmitting(false);
            setAmountInput("");
            setFormData({
                type: "cabunet",
                amount: 0,
                currency: (devise as "CDF" | "USD") || "CDF",
                correspondent: "",
                methodPayment: { type: "Momo", number: "", intitule: "" },
            });
        }
    }, [isOpen, devise]);

    if (!isOpen) return null;

    const numericMontant = Number(amountInput) || 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (numericMontant <= 0) {
            setLocalError('Le montant doit être supérieur à 0.');
            return;
        }
        if (numericMontant > montantDisponible) {
            setLocalError(
                `Le montant ne peut pas dépasser ${montantDisponible.toLocaleString()} ${devise}.`
            );
            return;
        }
        if (!formData.methodPayment.number.trim()) {
            setLocalError('Le numéro de paiement est requis.');
            return;
        }
        if (!formData.methodPayment.intitule.trim()) {
            setLocalError("L'intitulé est requis.");
            return;
        }

        try {
            setSubmitting(true);


            const processData = await retraitsService.retirerCommission({
                ...formData,
                amount: numericMontant,
            }, token)

            console.log('data', processData)
            const pawapayData = processData?.data?.pawapayData

            if (!processData.success) {

                const failureReason = pawapayData?.failureReason
                const failureCode = failureReason?.failureCode
                const message = getPawapayError(failureCode)
                alertError(`${processData.message}: ${message}`)
                return
            }

            await onSuccess()

            onClose();
        } catch (err: any) {
            setLocalError(err?.message || 'Une erreur est survenue.');
        } finally {
            setSubmitting(false);
        }
    };


    const busy = submitting || loading;

    return (
        <BaseModal icon={<LogOut />} isOpen={isOpen} title="Retirer  commission Cabunet" onClose={onClose}>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <p className="text-blue-800">
                        Commission disponible :{' '}
                        <span className="font-bold">
                            {montantDisponible.toLocaleString()} {devise}
                        </span>
                    </p>
                </div>

                {/* Devise */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Devise
                    </label>
                    <select
                        value={formData.currency}
                        onChange={(e) =>
                            setFormData((f) => ({
                                ...f,
                                currency: e.target.value as "CDF" | "USD",
                            }))
                        }
                        disabled={busy}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                    >
                        {currencies.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Montant */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Montant à retirer ({formData.currency})
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="any"
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        placeholder="0"
                        autoFocus
                        disabled={busy}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                    />
                    <div className="flex justify-end mt-1">
                        <button
                            type="button"
                            onClick={() => setAmountInput(String(montantDisponible))}
                            disabled={busy}
                            className="text-xs text-primary hover:underline disabled:opacity-50"
                        >
                            Tout retirer ({montantDisponible.toLocaleString()} {devise})
                        </button>
                    </div>
                </div>

                {/* Type de paiement */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type de paiement
                    </label>
                    <select
                        value={formData.methodPayment.type}
                        onChange={(e) =>
                            setFormData((f) => ({
                                ...f,
                                methodPayment: {
                                    ...f.methodPayment,
                                    type: e.target.value as "Momo" | "Bank",
                                },
                            }))
                        }
                        disabled={busy}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                    >
                        <option value="Momo">Momo</option>
                        <option value="Bank">Bank</option>
                    </select>
                </div>

                {/* Correspondent (provider) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Opérateur
                    </label>
                    <select
                        value={formData.correspondent}
                        onChange={(e) =>
                            setFormData((f) => ({ ...f, correspondent: e.target.value }))
                        }
                        disabled={busy}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                    >
                        <option value="">-- Sélectionner --</option>
                        {providersRDC.map((p) => (
                            <option key={p.value} value={p.value}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Numéro */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Numéro
                    </label>
                    <input
                        type="text"
                        value={formData.methodPayment.number}
                        onChange={(e) =>
                            setFormData((f) => ({
                                ...f,
                                methodPayment: { ...f.methodPayment, number: e.target.value },
                            }))
                        }
                        placeholder="+243..."
                        disabled={busy}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                    />
                </div>

                {/* Intitulé */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Intitulé
                    </label>
                    <input
                        type="text"
                        value={formData.methodPayment.intitule}
                        onChange={(e) =>
                            setFormData((f) => ({
                                ...f,
                                methodPayment: { ...f.methodPayment, intitule: e.target.value },
                            }))
                        }
                        placeholder="Nom du bénéficiaire"
                        disabled={busy}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                    />
                </div>

                {(localError || error) && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{localError || error}</span>
                    </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={busy}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={busy || numericMontant <= 0}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {busy ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Traitement...
                            </>
                        ) : (
                            <>
                                <Banknote className="h-4 w-4" />
                                Confirmer le retrait
                            </>
                        )}
                    </button>
                </div>
            </form>
        </BaseModal>
    );
}