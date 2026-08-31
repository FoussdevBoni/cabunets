import { useEffect, useState } from 'react';
import useSettings from '../../hooks/settings/useSettings';
import {
    Save,
    RefreshCw,
    DollarSign,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Wallet
} from 'lucide-react';

export default function AdminSettingsPage() {
    const {
        settings,
        loading,
        error,
        getSettings,
        updateCommission,
        updateExchangeRate,
        updateDefaultCurrency,
        updateWithdrawalLimits,
        clearError
    } = useSettings();

    const [commissionRate, setCommissionRate] = useState<number>(0);
    const [defaultCurrency, setDefaultCurrency] = useState<string>('CDF');
    const [minWithdrawal, setMinWithdrawal] = useState<number>(0);
    const [maxWithdrawal, setMaxWithdrawal] = useState<number>(0);
    const [exchangeRates, setExchangeRates] = useState<{ currency: string; rate: number }[]>([]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        getSettings();
    }, []);

    useEffect(() => {
        if (settings) {
            setCommissionRate(settings.commissionRate);
            setDefaultCurrency(settings.defaultDisplayCurrency);
            setMinWithdrawal(settings.minWithdrawalAmount);
            setMaxWithdrawal(settings.maxWithdrawalAmount);
            setExchangeRates(
                settings.exchangeRates.map((r: any) => ({
                    currency: r.currency,
                    rate: r.rate
                }))
            );
        }
    }, [settings]);

    

    const handleSaveCommission = async () => {
        try {
            await updateCommission(commissionRate);
            setSuccessMessage('Commission mise à jour avec succès');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveExchangeRate = async (currency: string, rate: number) => {
        try {
            await updateExchangeRate(currency, rate);
            setSuccessMessage(`Taux de change ${currency} mis à jour`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveDefaultCurrency = async () => {
        try {
            await updateDefaultCurrency(defaultCurrency);
            setSuccessMessage('Devise par défaut mise à jour');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveLimits = async () => {
        try {
            await updateWithdrawalLimits(minWithdrawal, maxWithdrawal);
            setSuccessMessage('Limites de retrait mises à jour');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                        <h2 className="text-lg font-bold text-red-800">Erreur</h2>
                    </div>
                    <p className="text-red-700">{error}</p>
                    <button
                        onClick={() => { clearError(); getSettings(); }}
                        className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* En-tête */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
                        <p className="text-gray-600">Gestion des commissions, taux de change et limites</p>
                    </div>
                    <button
                        onClick={() => getSettings()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Actualiser
                    </button>
                </div>

                {/* Message de succès */}
                {successMessage && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-700">{successMessage}</span>
                    </div>
                )}

                {/* Commission */}
                <div className="bg-white rounded-xl border p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Commission
                    </h2>
                    <div className="flex items-end gap-4">
                        <div className="flex-1">
                            <label className="block text-sm text-gray-600 mb-1">
                                Taux de commission (%)
                            </label>
                            <input
                                type="number"
                                value={commissionRate}
                                onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                step="0.1"
                                min="0"
                                max="100"
                            />
                        </div>
                        <button
                            onClick={handleSaveCommission}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" />
                            Enregistrer
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Actuellement: {settings?.commissionRate ? settings.commissionRate  : 0}%
                    </p>
                </div>

                {/* Devise par défaut */}
                <div className="bg-white rounded-xl border p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Devise d'affichage
                    </h2>
                    <div className="flex items-end gap-4">
                        <div className="flex-1">
                            <label className="block text-sm text-gray-600 mb-1">
                                Devise par défaut
                            </label>
                            <select
                                value={defaultCurrency}
                                onChange={(e) => setDefaultCurrency(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="CDF">CDF - Franc Congolais</option>
                                <option value="USD">USD - Dollar US</option>
                                <option value="FCFA">FCFA - Franc CFA</option>
                                <option value="XOF">XOF - Franc CFA</option>
                                <option value="EUR">EUR - Euro</option>
                            </select>
                        </div>
                        <button
                            onClick={handleSaveDefaultCurrency}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" />
                            Enregistrer
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Actuelle: {settings?.defaultDisplayCurrency || 'CDF'}
                    </p>
                </div>

                {/* Taux de change */}
                <div className="bg-white rounded-xl border p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Taux de change</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Taux par rapport à la devise de base: {settings?.baseCurrency || 'USD'}
                    </p>
                    <div className="space-y-3">
                        {exchangeRates.map((item) => (
                            <div key={item.currency} className="flex items-end gap-4">
                                <div className="w-24">
                                    <label className="block text-sm text-gray-600 mb-1">
                                        {item.currency}
                                    </label>
                                    <div className="px-4 py-2 bg-gray-50 border rounded-lg font-medium">
                                        {item.currency}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Taux
                                    </label>
                                    <input
                                        type="number"
                                        value={item.rate}
                                        onChange={(e) => {
                                            const newRates = exchangeRates.map((r) =>
                                                r.currency === item.currency
                                                    ? { ...r, rate: parseFloat(e.target.value) || 0 }
                                                    : r
                                            );
                                            setExchangeRates(newRates);
                                        }}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                                <button
                                    onClick={() => handleSaveExchangeRate(item.currency, item.rate)}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                >
                                    <Save className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Limites de retrait */}
                <div className="bg-white rounded-xl border p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-primary" />
                        Limites de retrait
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">
                                Montant minimum ({settings?.defaultDisplayCurrency || 'CDF'})
                            </label>
                            <input
                                type="number"
                                value={minWithdrawal}
                                onChange={(e) => setMinWithdrawal(parseFloat(e.target.value) || 0)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">
                                Montant maximum ({settings?.defaultDisplayCurrency || 'CDF'})
                            </label>
                            <input
                                type="number"
                                value={maxWithdrawal}
                                onChange={(e) => setMaxWithdrawal(parseFloat(e.target.value) || 0)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                min="0"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSaveLimits}
                        className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        Enregistrer les limites
                    </button>
                </div>
            </div>
        </div>
    );
}