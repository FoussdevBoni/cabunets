// pages/admin/WalletsPage.tsx
import React, { useEffect, useState } from 'react';
import useWallet, { IWalletInfo } from '../../hooks/wallet/useWallet';
import {
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  AlertCircle,
  Banknote,
  Percent,
  Globe,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RetraitCommissionModal from '../../components/features/retraits/RetraitCommissionModal';

export default function WalletsPage() {
  const {
    wallets,
    loading,
    error,
    getAllWallets,
    clearError,
    getCabunetWallet,
    cabunetWallet,
    pawaPayBalances,
    getPawaPayBalances,
  } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('totalInDisplay.wallet');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [commissionModalOpen, setCommissionModalOpen] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const navigate = useNavigate();

  const effectRetrait = (wallet: IWalletInfo) => {
    navigate(`/admin/nouveau-retrait`, { state: { userId: wallet.vendeurId } });
  };

  const onSuccess = async () => {
    try {
      setWithdrawLoading(true);
      setWithdrawError(null);
      await getAllWallets();
      await getCabunetWallet();
      await getPawaPayBalances();
    } catch (err: any) {
      setWithdrawError(err?.message || 'Échec du retrait de commission');
      throw err;
    } finally {
      setWithdrawLoading(false);
    }
  };




  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleExpand = (vendeurId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(vendeurId)) {
      newExpanded.delete(vendeurId);
    } else {
      newExpanded.add(vendeurId);
    }
    setExpandedRows(newExpanded);
  };

  const filteredWallets = wallets.filter((w) => {
    const search = searchTerm.toLowerCase();
    return (
      w.vendeur?.username?.toLowerCase().includes(search) ||
      w.vendeur?.email?.toLowerCase().includes(search) ||
      w.vendeur?.whatsappNumber?.includes(search) ||
      w.vendeurId.includes(search)
    );
  });

  const sortedWallets = [...filteredWallets].sort((a, b) => {
    let aVal: any;
    let bVal: any;

    if (sortField === 'totalInDisplay.wallet') {
      aVal = a.totalInDisplay.wallet;
      bVal = b.totalInDisplay.wallet;
    } else if (sortField === 'totalInDisplay.ca') {
      aVal = a.totalInDisplay.ca;
      bVal = b.totalInDisplay.ca;
    } else if (sortField === 'ordersCount') {
      aVal = a.ordersCount;
      bVal = b.ordersCount;
    } else if (sortField === 'vendeur.username') {
      aVal = a.vendeur?.username || '';
      bVal = b.vendeur?.username || '';
    } else {
      aVal = a.totalInDisplay.wallet;
      bVal = b.totalInDisplay.wallet;
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalWallet = wallets.reduce((sum, w) => sum + w.totalInDisplay.wallet, 0);
  const totalCA = wallets.reduce((sum, w) => sum + w.totalInDisplay.ca, 0);
  const totalCommission = wallets.reduce((sum, w) => sum + w.totalInDisplay.commission, 0);
  const totalRetraits = wallets.reduce((sum, w) => sum + (w.totalInDisplay.retraits || 0), 0);

  if (loading && wallets.length === 0) {
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
            onClick={() => {
              clearError();
              getAllWallets();
            }}
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
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Portefeuilles des vendeurs</h1>
            <p className="text-gray-600">Gestion des soldes et commissions des vendeurs</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCommissionModalOpen(true)}
              disabled={totalCommission <= 0}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Percent className="h-4 w-4" />
              Retirer la commission
            </button>
            <button
              onClick={() => {
                getAllWallets();
                getCabunetWallet();
                getPawaPayBalances();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total disponible des portefeuilles des vendeurs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalWallet.toLocaleString()} {wallets[0]?.totalInDisplay.currency || 'CDF'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Chiffre d'affaires total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalCA.toLocaleString()} {wallets[0]?.totalInDisplay.currency || 'CDF'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Commission totale restante</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cabunetWallet?.disponible.toLocaleString()} {wallets[0]?.totalInDisplay.currency || 'CDF'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total des retraits des vendeurs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalRetraits.toLocaleString()} {wallets[0]?.totalInDisplay.currency || 'CDF'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Banknote className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total des retraits de commission</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cabunetWallet?.retiree.toLocaleString()} {wallets[0]?.totalInDisplay.currency || 'CDF'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Banknote className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Soldes PawaPay */}
        {pawaPayBalances.length > 0 && (
          <div className="bg-white rounded-xl border p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Globe className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Soldes PawaPay</h2>
                <p className="text-sm text-gray-500">Soldes réels disponibles chez PawaPay</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pawaPayBalances.map((balance) => (
                <div
                  key={`${balance.country}-${balance.currency}`}
                  className="bg-indigo-50 rounded-lg border border-indigo-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-indigo-700">
                      {balance.country}
                    </span>
                    <span className="text-xs font-medium text-indigo-600">
                      {balance.currency}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-indigo-900 mt-2">
                    {parseFloat(balance.balance).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recherche */}
        <div className="bg-white rounded-xl border p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un vendeur (nom, email, téléphone)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('vendeur.username')}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Vendeur
                      {sortField === 'vendeur.username' &&
                        (sortDirection === 'asc' ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('ordersCount')}
                      className="flex items-center gap-1 hover:text-gray-700 ml-auto"
                    >
                      Commandes
                      {sortField === 'ordersCount' &&
                        (sortDirection === 'asc' ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('totalInDisplay.ca')}
                      className="flex items-center gap-1 hover:text-gray-700 ml-auto"
                    >
                      CA
                      {sortField === 'totalInDisplay.ca' &&
                        (sortDirection === 'asc' ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </button>
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('totalInDisplay.wallet')}
                      className="flex items-center gap-1 hover:text-gray-700 ml-auto"
                    >
                      Solde
                      {sortField === 'totalInDisplay.wallet' &&
                        (sortDirection === 'asc' ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedWallets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Aucun vendeur trouvé
                    </td>
                  </tr>
                ) : (
                  sortedWallets.map((wallet) => (
                    <React.Fragment key={wallet.vendeurId}>
                      <tr className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {wallet.vendeur?.avatar ? (
                              <img
                                src={wallet.vendeur.avatar}
                                alt={wallet.vendeur.username}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                {wallet.vendeur?.username?.charAt(0).toUpperCase() || 'V'}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">
                                {wallet.vendeur?.username || 'Inconnu'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {wallet.vendeur?.email ||
                                  wallet.vendeur?.whatsappNumber ||
                                  wallet.vendeurId}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-gray-900">{wallet.ordersCount}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-gray-900">
                            {wallet.totalInDisplay.ca.toLocaleString()}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <span
                            className={`font-bold ${
                              wallet.totalInDisplay.wallet > 0
                                ? 'text-green-600'
                                : 'text-gray-400'
                            }`}
                          >
                            {wallet.totalInDisplay.wallet.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-400 ml-1">
                            {wallet.totalInDisplay.currency}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => toggleExpand(wallet.vendeurId)}
                              className="p-1 hover:bg-gray-100 rounded-lg transition"
                              title="Voir les détails"
                            >
                              <Eye className="h-5 w-5 text-gray-500" />
                            </button>
                            <button
                              onClick={() => effectRetrait(wallet)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition"
                              title="Effectuer un retrait"
                            >
                              <Banknote className="h-4 w-4" />
                              Retrait
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedRows.has(wallet.vendeurId) && (
                        <tr className="bg-gray-50">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="bg-white rounded-lg border p-4">
                                <p className="text-sm text-gray-500">Détails par devise</p>
                                <div className="mt-2 space-y-1">
                                  {wallet.details.map((detail) => (
                                    <div
                                      key={detail.currency}
                                      className="flex justify-between text-sm"
                                    >
                                      <span className="text-gray-600">{detail.currency}</span>
                                      <span className="font-medium">
                                        CA: {detail.ca.toLocaleString()} | Net:{' '}
                                        {detail.net.toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="bg-white rounded-lg border p-4">
                                <p className="text-sm text-gray-500">Devise de base</p>
                                <div className="mt-2 space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">CA</span>
                                    <span className="font-medium">
                                      {wallet.totalInBase.ca.toLocaleString()}{' '}
                                      {wallet.totalInBase.currency}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Commission</span>
                                    <span className="font-medium">
                                      {wallet.totalInBase.commission.toLocaleString()}{' '}
                                      {wallet.totalInBase.currency}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Net</span>
                                    <span className="font-medium">
                                      {wallet.totalInBase.net.toLocaleString()}{' '}
                                      {wallet.totalInBase.currency}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Retraits</span>
                                    <span className="font-medium">
                                      {wallet.totalInBase.retraits.toLocaleString()}{' '}
                                      {wallet.totalInBase.currency}
                                    </span>
                                  </div>
                                  <div className="flex justify-between border-t pt-1 mt-1">
                                    <span className="font-medium text-gray-900">Solde</span>
                                    <span className="font-bold text-green-600">
                                      {wallet.totalInBase.wallet.toLocaleString()}{' '}
                                      {wallet.totalInBase.currency}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-white rounded-lg border p-4">
                                <p className="text-sm text-gray-500">
                                  Informations vendeur
                                </p>
                                <div className="mt-2 space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">ID</span>
                                    <span className="font-mono text-xs">
                                      {wallet.vendeurId}
                                    </span>
                                  </div>

                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Nombre retraits</span>
                                    <span className="font-medium">
                                      {wallet.retraitsCount}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t bg-gray-50 text-sm text-gray-500">
            {sortedWallets.length} vendeur{sortedWallets.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Modal de retrait de commission (global admin) */}
      <RetraitCommissionModal
        isOpen={commissionModalOpen}
        onClose={() => {
          setCommissionModalOpen(false);
          setWithdrawError(null);
        }}
        onSuccess={onSuccess}
        montantDisponible={totalCommission}
        devise={wallets[0]?.totalInDisplay.currency || 'CDF'}
        loading={withdrawLoading}
        error={withdrawError}
      />
    </div>
  );
}