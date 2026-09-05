import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useToken from '../../../hooks/auth/useToken';
import { uploadService } from "../../../services/uploadFileService";
import { Notification } from '../../../types/Notification';
import { alertError, alertSuccess } from '../../../helpers/alertError';
import { X, Send, Loader2, Image, Users, User, Check } from 'lucide-react';
import useNotifications from '../../../hooks/notifications/useNotifications';
import useUsers from '../../../hooks/users/useUsers';

interface NotificationFormProps {
    notification?: Notification;
    isEdit?: boolean;
    onSuccess?: () => void;
}

export default function NotificationForm({ notification, isEdit = false, onSuccess }: NotificationFormProps) {
    const navigate = useNavigate();
    const { token } = useToken();
    const { createNotification, updateNotification } = useNotifications({});
    const { data: users } = useUsers({});
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [existingAttachements, setExistingAttachements] = useState<string[]>([]);

    const vendeurs = users?.filter((u) => u.role === "vendeur") || [];
    const clients = users?.filter((u) => u.role === "client") || [];

    const [formData, setFormData] = useState({
        title: "",
        body: "",
        type: "general" as "general" | "private" | "whatsapp",
        receivers: [] as string[],
        attachments: [] as File[],
        selectAll: false,
        selectAllVendeurs: false,
        selectAllClients: false,
    });

    useEffect(() => {
        if (notification && isEdit) {
            setFormData({
                title: notification.title || "",
                body: notification.body || "",
                type: notification.type || "general",
                receivers: notification.receivers || [],
                attachments: [],
                selectAll: false,
                selectAllVendeurs: false,
                selectAllClients: false,
            });
            setExistingAttachements(notification.attachments || []);
        }
    }, [notification, isEdit]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
            if (files.length === 0) {
                alertError("Seules les images sont autorisées");
                return;
            }
            setFormData({ ...formData, attachments: [...formData.attachments, ...files] });
            const urls = files.map(file => URL.createObjectURL(file));
            setPreviewUrls([...previewUrls, ...urls]);
        }
    };

    const removeFile = (index: number) => {
        const newFiles = formData.attachments.filter((_, i) => i !== index);
        const newPreviews = previewUrls.filter((_, i) => i !== index);
        setFormData({ ...formData, attachments: newFiles });
        setPreviewUrls(newPreviews);
    };

    const removeExistingFile = (url: string) => {
        setExistingAttachements(existingAttachements.filter((file) => file !== url));
    };

    const toggleReceiver = (userId: string) => {
        if (formData.receivers.includes(userId)) {
            setFormData({
                ...formData,
                receivers: formData.receivers.filter((id) => id !== userId),
                selectAll: false,
                selectAllVendeurs: false,
                selectAllClients: false,
            });
        } else {
            setFormData({
                ...formData,
                receivers: [...formData.receivers, userId],
                selectAll: false,
                selectAllVendeurs: false,
                selectAllClients: false,
            });
        }
    };

    const selectAllUsers = () => {
        if (formData.selectAll) {
            setFormData({ ...formData, receivers: [], selectAll: false });
        } else {
            const allUsers = [...vendeurs, ...clients].map((u) => u.id || u._id || "");

            setFormData({
                ...formData,
                receivers: allUsers,
                selectAll: true,
                selectAllVendeurs: false,
                selectAllClients: false,
            });
        }
    };

    const selectAllVendeurs = () => {
        if (formData.selectAllVendeurs) {
            const vendeurIds = vendeurs.map((u) => u.id);
            setFormData({
                ...formData,
                receivers: formData.receivers.filter((id) => !vendeurIds.includes(id)),
                selectAllVendeurs: false,
                selectAll: false,
            });
        } else {
            const vendeurIds = vendeurs.map((u) => u.id || u._id || "");
            const newReceivers = [...new Set([...formData.receivers, ...vendeurIds])];
            setFormData({
                ...formData,
                receivers: newReceivers,
                selectAllVendeurs: true,
                selectAll: false,
                selectAllClients: false,
            });
        }
    };

    const selectAllClients = () => {
        if (formData.selectAllClients) {
            const clientIds = clients.map((u) => u.id);
            setFormData({
                ...formData,
                receivers: formData.receivers.filter((id) => !clientIds.includes(id)),
                selectAllClients: false,
                selectAll: false,
            });
        } else {
            const clientIds = clients.map((u) => u.id || u._id || "");
            const newReceivers = [...new Set([...formData.receivers, ...clientIds])];
            setFormData({
                ...formData,
                receivers: newReceivers,
                selectAllClients: true,
                selectAll: false,
                selectAllVendeurs: false,
            });
        }
    };

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            alertError("Le titre est obligatoire");
            return;
        }

        if (!formData.body.trim()) {
            alertError("Le contenu est obligatoire");
            return;
        }

        setLoading(true);
        try {
            let attachmentsUrls: string[] = [];

            if (formData.attachments.length > 0) {
                setUploading(true);
                try {
                    const uploadedUrls = await uploadService.uploadMultiple(formData.attachments, token);
                    attachmentsUrls = [...uploadedUrls];
                } catch (error: any) {
                    alertError("Erreur lors de l'upload des fichiers");
                    setLoading(false);
                    setUploading(false);
                    return;
                }
                setUploading(false);
            }

            const allAttachements = [...existingAttachements, ...attachmentsUrls];

            const data = {
                title: formData.title,
                body: formData.body,
                type: formData.type,
                receivers: (formData.type === "private" || formData.type === "whatsapp") ? formData.receivers : [],
                attachments: allAttachements,
            };

            let response;
            if (isEdit && notification) {
                response = await updateNotification(notification.id || notification._id || "", data);
            } else {
                response = await createNotification(data);
            }

            if (response) {
                alertSuccess(
                    isEdit
                        ? "Notification modifiée avec succès"
                        : "Notification créée avec succès"
                );
                if (onSuccess) {
                    onSuccess();
                } else {
                    navigate(-1);
                }
            }
        } catch (error: any) {
            console.error(error);
            alertError(error?.response?.data?.error || "Erreur lors de l'opération");
        } finally {
            setLoading(false);
            setUploading(false);
            previewUrls.forEach(url => URL.revokeObjectURL(url));
            setPreviewUrls([]);
        }
    };

    const showReceiverSelection = formData.type === "private" || formData.type === "whatsapp";

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <form onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Titre <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Titre de la notification"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                            required
                            disabled={loading || uploading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contenu <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.body}
                            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                            placeholder="Contenu de la notification..."
                            rows={5}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 resize-none"
                            required
                            disabled={loading || uploading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    type: e.target.value as "general" | "private" | "whatsapp",
                                    receivers: [],
                                    selectAll: false,
                                    selectAllVendeurs: false,
                                    selectAllClients: false,
                                });
                            }}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                            disabled={loading || uploading}
                        >
                            <option value="general">Générale</option>
                            <option value="private">Privée</option>
                            <option value="whatsapp">WhatsApp</option>
                        </select>
                    </div>

                    {showReceiverSelection && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Destinataires
                            </label>

                            <div className="flex flex-wrap gap-2 mb-3">
                                <button
                                    type="button"
                                    onClick={selectAllUsers}
                                    className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition ${
                                        formData.selectAll
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                    disabled={loading || uploading}
                                >
                                    <Users size={16} />
                                    Tous les utilisateurs
                                    {formData.selectAll && <Check size={14} />}
                                </button>
                                <button
                                    type="button"
                                    onClick={selectAllVendeurs}
                                    className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition ${
                                        formData.selectAllVendeurs
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                    disabled={loading || uploading}
                                >
                                    <User size={16} />
                                    Vendeurs
                                    {formData.selectAllVendeurs && <Check size={14} />}
                                </button>
                                <button
                                    type="button"
                                    onClick={selectAllClients}
                                    className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition ${
                                        formData.selectAllClients
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                    disabled={loading || uploading}
                                >
                                    <User size={16} />
                                    Clients
                                    {formData.selectAllClients && <Check size={14} />}
                                </button>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                                <p className="text-xs text-gray-500 mb-2">
                                    {formData.receivers.length} destinataire(s) sélectionné(s)
                                </p>
                                <div className="space-y-1">
                                    {[...vendeurs, ...clients].map((user) => (
                                        <label key={user.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                            <input
                                                type="checkbox"
                                                checked={formData.receivers.includes(user.id || user._id || "")}
                                                onChange={() => toggleReceiver(user.id || user._id || "")}
                                                disabled={loading || uploading}
                                                className="w-4 h-4 text-primary rounded border-gray-300"
                                            />
                                            <span className="text-sm text-gray-700">
                                                {user.username || user.email || user.id}
                                                <span className="text-xs text-gray-400 ml-1">
                                                    ({user.role === "vendeur" ? "Vendeur" : "Client"})
                                                </span>
                                            </span>
                                        </label>
                                    ))}
                                    {[...vendeurs, ...clients].length === 0 && (
                                        <p className="text-sm text-gray-400">Aucun utilisateur trouvé</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Images
                        </label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                                <Image size={18} />
                                <span>Choisir des images</span>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={loading || uploading}
                                    accept=".jpg,.jpeg,.png,.gif"
                                />
                            </label>
                            <span className="text-sm text-gray-500">
                                {formData.attachments.length} image(s) sélectionnée(s)
                            </span>
                        </div>

                        {previewUrls.length > 0 && (
                            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {previewUrls.map((url, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={url}
                                            alt={`Aperçu ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                                            disabled={loading || uploading}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {existingAttachements.length > 0 && (
                            <div className="mt-3">
                                <p className="text-sm text-gray-500 mb-2">Images existantes :</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {existingAttachements.map((url, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={url}
                                                alt={`Image ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingFile(url)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                                                disabled={loading || uploading}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p className="text-xs text-gray-400 mt-2">
                            Formats acceptés: JPG, JPEG, PNG, GIF (max 5MB)
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                            disabled={loading || uploading}
                        >
                            <X size={18} />
                            Annuler
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || uploading}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
                        >
                            {loading || uploading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    {uploading ? "Upload en cours..." : isEdit ? "Modification..." : "Envoi..."}
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    {isEdit ? "Modifier" : "Créer"}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}