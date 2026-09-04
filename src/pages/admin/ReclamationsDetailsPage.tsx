import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useToken from '../../hooks/auth/useToken';
import { reclamationsService } from '../../hooks/reclamations/useReclamations';
import PageLitLayout from '../../layouts/PageListLayout';
import { X, ZoomIn } from 'lucide-react';
import PageLayout from '../../layouts/PageLayout';

export default function ReclamationsDetailsPage() {
    const { id } = useParams();
    const { token } = useToken();
    const [reclamation, setReclamation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        if (id && token) {
            fetchReclamation();
        }
    }, [id, token]);

    const fetchReclamation = async () => {
        setLoading(true);
        try {
            const data = await reclamationsService.getById(id!, token);
            setReclamation(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getStatutColor = (statut: string) => {
        if (statut === "resolue") return "bg-green-100 text-green-800";
        if (statut === "rejetee") return "bg-red-100 text-red-800";
        if (statut === "en_cours") return "bg-blue-100 text-blue-800";
        return "bg-yellow-100 text-yellow-800";
    };

    const getStatutText = (statut: string) => {
        if (statut === "resolue") return "Résolue";
        if (statut === "rejetee") return "Rejetée";
        if (statut === "en_cours") return "En cours";
        return "Soumise";
    };

    if (loading) {
        return (
            <PageLitLayout title="Détails de la réclamation">
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </PageLitLayout>
        );
    }

    if (!reclamation) {
        return (
            <PageLayout title="Détails de la réclamation">
                <div className="text-center py-12">
                    <p className="text-gray-500">Réclamation non trouvée</p>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout title="">
            <div className="px-6 py-4 bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-900">Détails de la réclamation</h1>
                    <p className="text-sm text-gray-500 mt-1">{reclamation.reference || `#${reclamation._id}`}</p>
                </div>
            </div>

            <div className="px-6 py-8 max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">{reclamation.objet}</h2>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(reclamation.statut)}`}>
                                    {getStatutText(reclamation.statut)}
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">{reclamation.description || "Aucune description"}</p>
                        </div>

                        {reclamation.user && (
                            <div className="border-t border-gray-200 pt-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Soumis par</h3>
                                <p className="text-gray-600">{reclamation.user.username || reclamation.user.email || reclamation.user.id}</p>
                            </div>
                        )}

                        {reclamation.linkedEntities && reclamation.linkedEntities.length > 0 && (
                            <div className="border-t border-gray-200 pt-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Lié à</h3>
                                <div className="space-y-1">
                                    {reclamation.linkedEntities.map((entity: any, index: number) => (
                                        <p key={index} className="text-gray-600 text-sm">
                                            {entity.type}: {entity.id}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {reclamation.attachements && reclamation.attachements.length > 0 && (
                            <div className="border-t border-gray-200 pt-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Images</h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {reclamation.attachements.map((url: string, index: number) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={url}
                                                alt={`Image ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition"
                                                onClick={() => setSelectedImage(url)}
                                            />
                                            <button
                                                onClick={() => setSelectedImage(url)}
                                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40 rounded-lg"
                                            >
                                                <ZoomIn className="text-white" size={24} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Informations</h3>
                            <p className="text-sm text-gray-500">Créé le: {new Date(reclamation.createdAt).toLocaleString()}</p>
                            <p className="text-sm text-gray-500">Modifié le: {new Date(reclamation.updatedAt).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal pour afficher l'image en grand */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
                        >
                            <X size={32} />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Agrandissement"
                            className="max-w-full max-h-[85vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </PageLayout>
    );
}