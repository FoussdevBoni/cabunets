import { useEffect, useState } from "react";
import { alertError, alertSuccess } from "../../../helpers/alertError";
import { reclamationsService } from "../../../hooks/reclamations/useReclamations";
import { useNavigate } from "react-router-dom";
import useToken from "../../../hooks/auth/useToken";
import { useAuth } from "../../../hooks/auth/useAuth";
import { uploadService } from "../../../services/uploadFileService";
import { X, Send, Loader2, Upload, FileText, Image } from "lucide-react";
import { LinkedEntity, Reclamation } from "../../../types/Reclamation";
import useOrders from "../../../hooks/orders/useOrders";
import useOffres from "../../../hooks/offres/useOffres";
import useUsers from "../../../hooks/users/useUsers";

interface ReclamationFormProps {
    reclamation?: Reclamation;
    isEdit?: boolean;
    onSuccess?: () => void;
}

export default function ReclamationForm({ reclamation, isEdit = false, onSuccess }: ReclamationFormProps) {
    const navigate = useNavigate();
    const { token } = useToken();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const { data: orders } = useOrders({
        filters: { clientId: user?.id }
    });
    const { data: offers } = useOffres({});
    const { data: users } = useUsers({});

    const vendeurs = users.filter((u) => u.role === "vendeur");
    const clients = users.filter((u) => u.role === "client");

    const [formData, setFormData] = useState({
        objet: "",
        description: "",
        attachements: [] as File[],
        statut: "soumise" as Reclamation['statut'],
        concerneCommande: false,
        commandeId: "",
        concerneOffre: false,
        offreId: "",
        concerneVendeur: false,
        vendeurId: "",
        concerneClient: false,
        clientId: ""
    });
    const [existingAttachements, setExistingAttachements] = useState<string[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    useEffect(() => {
        if (reclamation && isEdit) {
            const linkedEntities = reclamation.linkedEntities || [];
            const commande = linkedEntities.find(e => e.type === "order");
            const offre = linkedEntities.find(e => e.type === "offer");
            const vendeur = linkedEntities.find(e => e.type === "vendeur");
            const client = linkedEntities.find(e => e.type === "client");

            setFormData({
                objet: reclamation.objet || "",
                description: reclamation.description || "",
                attachements: [],
                statut: reclamation.statut || "soumise",
                concerneCommande: !!commande,
                commandeId: commande?.id || "",
                concerneOffre: !!offre,
                offreId: offre?.id || "",
                concerneVendeur: !!vendeur,
                vendeurId: vendeur?.id || "",
                concerneClient: !!client,
                clientId: client?.id || ""
            });
            setExistingAttachements(reclamation.attachements || []);
        }
    }, [reclamation, isEdit]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
            if (files.length === 0) {
                alertError("Seules les images sont autorisées");
                return;
            }
            setFormData({ ...formData, attachements: [...formData.attachements, ...files] });

            // Générer les aperçus
            const urls = files.map(file => URL.createObjectURL(file));
            setPreviewUrls([...previewUrls, ...urls]);
        }
    };

    const removeFile = (index: number) => {
        const newFiles = formData.attachements.filter((_, i) => i !== index);
        const newPreviews = previewUrls.filter((_, i) => i !== index);
        setFormData({ ...formData, attachements: newFiles });
        setPreviewUrls(newPreviews);
    };

    const removeExistingFile = (url: string) => {
        setExistingAttachements(existingAttachements.filter((file) => file !== url));
    };

    const handleSubmit = async () => {
        if (!formData.objet.trim()) {
            alertError("L'objet de la réclamation est obligatoire");
            return;
        }

        if (!formData.description?.trim()) {
            alertError("La description est obligatoire");
            return;
        }

        setLoading(true);
        try {
            let attachementsUrls: string[] = [];

            if (formData.attachements.length > 0) {
                setUploading(true);
                try {
                    const uploadedUrls = await uploadService.uploadMultiple(formData.attachements, token);
                    attachementsUrls = [...uploadedUrls];
                } catch (error: any) {
                    alertError("Erreur lors de l'upload des fichiers");
                    setLoading(false);
                    setUploading(false);
                    return;
                }
                setUploading(false);
            }

            const allAttachements = [...existingAttachements, ...attachementsUrls];

            const linkedEntities: LinkedEntity[] = [];
            if (formData.concerneCommande && formData.commandeId) {
                linkedEntities.push({ type: "order" as const, id: formData.commandeId });
            }
            if (formData.concerneOffre && formData.offreId) {
                linkedEntities.push({ type: "offer" as const, id: formData.offreId });
            }
            if (formData.concerneVendeur && formData.vendeurId) {
                linkedEntities.push({ type: "vendeur" as const, id: formData.vendeurId });
            }
            if (formData.concerneClient && formData.clientId) {
                linkedEntities.push({ type: "client" as const, id: formData.clientId });
            }

            let response;
            if (isEdit && reclamation) {
                response = await reclamationsService.update(
                    reclamation.id || reclamation._id || "",
                    {
                        objet: formData.objet,
                        description: formData.description,
                        attachements: allAttachements,
                        statut: formData.statut,
                        linkedEntities
                    },
                    token
                );
            } else {
                response = await reclamationsService.create(
                    {
                        userId: user?.id!,
                        objet: formData.objet,
                        description: formData.description,
                        attachements: allAttachements,
                        statut: "soumise",
                        linkedEntities
                    },
                    token
                );
            }

            if (response) {
                alertSuccess(
                    isEdit
                        ? "Réclamation modifiée avec succès"
                        : "Réclamation soumise avec succès"
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
            // Nettoyer les URLs des aperçus
            previewUrls.forEach(url => URL.revokeObjectURL(url));
            setPreviewUrls([]);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <form onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Objet <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.objet}
                            onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
                            placeholder="Ex: Problème de livraison"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                            required
                            disabled={loading || uploading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Décrivez votre réclamation en détail..."
                            rows={5}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 resize-none"
                            required
                            disabled={loading || uploading}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="concerneCommande"
                                checked={formData.concerneCommande}
                                onChange={(e) => setFormData({ ...formData, concerneCommande: e.target.checked, commandeId: "" })}
                                disabled={loading || uploading}
                                className="w-4 h-4 text-primary rounded border-gray-300"
                            />
                            <label htmlFor="concerneCommande" className="text-sm text-gray-700">
                                Cette réclamation concerne une commande
                            </label>
                        </div>

                        {formData.concerneCommande && (
                            <div className="ml-7">
                                <select
                                    value={formData.commandeId}
                                    onChange={(e) => setFormData({ ...formData, commandeId: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                                    disabled={loading || uploading}
                                >
                                    <option value="">Sélectionner une commande</option>
                                    {(orders || []).map((o) => (
                                        <option key={o.id} value={o.id}>
                                            Commande #{o.reference || o.id} - {o.network} - {o.price} {o.currency}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="concerneOffre"
                                checked={formData.concerneOffre}
                                onChange={(e) => setFormData({ ...formData, concerneOffre: e.target.checked, offreId: "" })}
                                disabled={loading || uploading}
                                className="w-4 h-4 text-primary rounded border-gray-300"
                            />
                            <label htmlFor="concerneOffre" className="text-sm text-gray-700">
                                Cette réclamation concerne une offre
                            </label>
                        </div>

                        {formData.concerneOffre && (
                            <div className="ml-7">
                                <select
                                    value={formData.offreId}
                                    onChange={(e) => setFormData({ ...formData, offreId: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                                    disabled={loading || uploading}
                                >
                                    <option value="">Sélectionner une offre</option>
                                    {(offers || []).map((o) => (
                                        <option key={o.id} value={o.id}>
                                            {o.vendeurName} - {o.network} - {o.units} unités
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="concerneVendeur"
                                checked={formData.concerneVendeur}
                                onChange={(e) => setFormData({ ...formData, concerneVendeur: e.target.checked, vendeurId: "" })}
                                disabled={loading || uploading}
                                className="w-4 h-4 text-primary rounded border-gray-300"
                            />
                            <label htmlFor="concerneVendeur" className="text-sm text-gray-700">
                                Cette réclamation concerne un vendeur
                            </label>
                        </div>

                        {formData.concerneVendeur && (
                            <div className="ml-7">
                                <select
                                    value={formData.vendeurId}
                                    onChange={(e) => setFormData({ ...formData, vendeurId: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                                    disabled={loading || uploading}
                                >
                                    <option value="">Sélectionner un vendeur</option>
                                    {vendeurs.map((v) => (
                                        <option key={v.id} value={v.id}>
                                            {v.username || v.email || v.id}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="concerneClient"
                                checked={formData.concerneClient}
                                onChange={(e) => setFormData({ ...formData, concerneClient: e.target.checked, clientId: "" })}
                                disabled={loading || uploading}
                                className="w-4 h-4 text-primary rounded border-gray-300"
                            />
                            <label htmlFor="concerneClient" className="text-sm text-gray-700">
                                Cette réclamation concerne un client
                            </label>
                        </div>

                        {formData.concerneClient && (
                            <div className="ml-7">
                                <select
                                    value={formData.clientId}
                                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                                    disabled={loading || uploading}
                                >
                                    <option value="">Sélectionner un client</option>
                                    {clients.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.username || c.email || c.id}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pièces jointes (Images uniquement)
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
                                {formData.attachements.length} image(s) sélectionnée(s)
                            </span>
                        </div>

                        {/* Aperçu des nouvelles images */}
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

                        {/* Images existantes */}
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

                    {isEdit && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Statut
                            </label>
                            <select
                                value={formData.statut}
                                onChange={(e) => setFormData({ ...formData, statut: e.target.value as Reclamation['statut'] })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50"
                                disabled={loading || uploading}
                            >
                                <option value="soumise">Soumise</option>
                                <option value="en_cours">En cours</option>
                                <option value="resolue">Résolue</option>
                                <option value="rejetee">Rejetée</option>
                            </select>
                        </div>
                    )}

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
                                    {isEdit ? "Modifier" : "Soumettre la réclamation"}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}