// pages/UserDetailsPage.tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar,

  Edit,
  Trash2,
  UserCog,
  Users,
  UserIcon,
  Shield,
  Camera
} from "lucide-react";
import {useUser} from "../../hooks/users/useUser";
import useToken from "../../hooks/auth/useToken";
import { alertSuccess, alertError } from "../../helpers/alertError";
import DeleteConfirmationModal from "../../components/ui/DeleteConfirmationModal";
import { userService } from "../../hooks/users/useUsers";

// Définir le type du profil
interface ProfileVendeur {
  whatsappNumber?: string;
  paymentAmount?: number;
  availability?: string;
  openingTime?: string;
  closingTime?: string;
  isOnline?: boolean;
  networks?: {
    Airtel: boolean;
    Vodacom: boolean;
    Africell: boolean;
    Orange: boolean;
  };
  photoUrls?: string[];
  nom?: string;
  tel?: string;
  address?: string;
}

export default function UserDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, userLoading: loading } = useUser({ userId: id! });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      const response = await  userService.delete(user.id || user._id || "")

      if (response) {
        alertSuccess("Utilisateur supprimé avec succès");
        navigate("/admin/users");
      }
    } catch (error) {
      console.error(error);
      alertError("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'admin':
        return <UserCog className="h-6 w-6" />;
      case 'vendeur':
        return <Users className="h-6 w-6" />;
      case 'client':
        return <UserIcon className="h-6 w-6" />;
      default:
        return <User className="h-6 w-6" />;
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'vendeur':
        return 'Vendeur';
      case 'client':
        return 'Client';
      default:
        return 'Inconnu';
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'text-purple-600 bg-purple-50';
      case 'vendeur':
        return 'text-blue-600 bg-blue-50';
      case 'client':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Utilisateur non trouvé</h2>
          <p className="text-gray-500 mt-2">Cet utilisateur n'existe pas ou a été supprimé</p>
          <button
            onClick={() => navigate("/admin/users")}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const profile = user.profile as ProfileVendeur;

  // Fonction pour obtenir les réseaux actifs
  const getActiveNetworks = () => {
    if (!profile?.networks) return [];
    return Object.entries(profile.networks)
      .filter(([_, active]) => active === true)
      .map(([name]) => name);
  };

  const activeNetworks = getActiveNetworks();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin/users")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-base font-medium">Détails de l'utilisateur</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/admin/users/${id}/edit`)}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Modifier
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Profil */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-gray-200 overflow-hidden">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                  {getRoleIcon(user.role)}
                  {getRoleLabel(user.role)}
                </span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 mt-1">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 mt-1">
                <Shield className="h-4 w-4" />
                <span className={`font-medium ${user.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                  {user.isVerified ? '✅ Vérifié' : '⏳ Non vérifié'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Informations du profil */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-gray-500" />
              <h3 className="font-bold text-gray-900">Informations du profil</h3>
            </div>
            <div className="space-y-3">
              {user.role === 'vendeur' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">WhatsApp</span>
                    <span className="font-medium">{profile?.whatsappNumber || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Prix/transaction</span>
                    <span className="font-medium">{profile?.paymentAmount || 0} FCFA</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Disponibilité</span>
                    <span className="font-medium">{profile?.availability || 'N/A'}</span>
                  </div>
                  {profile?.openingTime && profile?.closingTime && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Horaires</span>
                        <span className="font-medium">{profile.openingTime} - {profile.closingTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Statut</span>
                        <span className={`font-medium ${profile.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                          {profile.isOnline ? '🟢 En ligne' : '⚪ Hors ligne'}
                        </span>
                      </div>
                    </>
                  )}
                </>
              )}
              {user.role === 'admin' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Nom</span>
                    <span className="font-medium">{profile?.nom || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Téléphone</span>
                    <span className="font-medium">{profile?.tel || 'N/A'}</span>
                  </div>
                </>
              )}
              {user.role === 'client' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">WhatsApp</span>
                    <span className="font-medium">{profile?.whatsappNumber || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Adresse</span>
                    <span className="font-medium">{profile?.address || 'N/A'}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Informations système */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-gray-500" />
              <h3 className="font-bold text-gray-900">Informations système</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">ID</span>
                <span className="font-mono text-sm">{user.id || user._id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Inscrit le</span>
                <span className="font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Dernière mise à jour</span>
                <span className="font-medium">
                  {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '-'}
                </span>
              </div>
              {user.role === 'vendeur' && activeNetworks.length > 0 && (
                <div className="pt-3 border-t">
                  <span className="text-gray-600 block mb-2">Réseaux actifs</span>
                  <div className="flex flex-wrap gap-2">
                    {activeNetworks.map((name) => (
                      <span key={name} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Photos du vendeur */}
        {user.role === 'vendeur' && profile?.photoUrls && profile.photoUrls.length > 0 && (
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-5 w-5 text-gray-500" />
              <h3 className="font-bold text-gray-900">Photos</h3>
              <span className="ml-auto text-sm text-gray-500">
                {profile.photoUrls.length} photo(s)
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {profile.photoUrls.map((url: string, index: number) => (
                <div key={index} className="relative">
                  <div className="h-40 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={url}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 bg-primary text-white px-2 py-1 rounded text-xs">
                      Principale
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal suppression */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Supprimer l'utilisateur"
        message={`Supprimer l'utilisateur "${user.username}" ? Cette action est irréversible.`}
        confirmText={isDeleting ? "Suppression..." : "Supprimer"}
      />
    </div>
  );
}