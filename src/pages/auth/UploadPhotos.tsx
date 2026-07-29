import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/auth/useAuth"
import {
    Upload,

    CheckCircle,
    AlertCircle,
    Camera,
    Plus,
    Trash2,
    ArrowLeft,
    RefreshCw
} from "lucide-react"
import { Vendeur } from "../../utils/database"
import { authService } from "../../services/authService"
import useToken from "../../hooks/auth/useToken"
import { uploadService } from "../../services/uploadFileService"

export default function UploadPhotos() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { token } = useToken()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [loading, setLoading] = useState(false)
    const [isRetrying, setIsRetrying] = useState(false)
    const [uploadProgress, setUploadProgress] = useState<{ current: number, total: number } | null>(null)

    const [photoFiles, setPhotoFiles] = useState<File[]>([])
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
    const [failedUploads, setFailedUploads] = useState<{ index: number, file: File, error: string }[]>([])
    const [error, setError] = useState<string>("")
    const [success, setSuccess] = useState(false)

    const handlePhotoUploadClick = () => {
        fileInputRef.current?.click()
    }

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        setPhotoFiles(prev => [...prev, ...files])
        const newPreviews = files.map(file => URL.createObjectURL(file))
        setPhotoPreviews(prev => [...prev, ...newPreviews])

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const removePhoto = (index: number) => {
        setPhotoFiles(prev => prev.filter((_, i) => i !== index))
        setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
        setFailedUploads(prev => prev.filter(item => item.index !== index))
        setFailedUploads(prev => prev.map(item => ({
            ...item,
            index: item.index > index ? item.index - 1 : item.index
        })))
    }

    const handleRetry = async () => {
        if (failedUploads.length === 0) return

        setIsRetrying(true)
        setError("")
        setUploadProgress({ current: 0, total: failedUploads.length })

        try {
            const filesToRetry = failedUploads.map(item => item.file)

            const uploadedUrls = await uploadService.uploadMultiple(
                filesToRetry,
                token,
                undefined,
                undefined,
                (progress: { current: number; total: number }) => {
                    setUploadProgress({ current: progress.current, total: progress.total })
                }
            )

            const profile = user?.profile as Vendeur
            const allPhotoUrls = [...(profile?.photoUrls || []), ...uploadedUrls]

            await authService.updateUser(
                token,
                user?.id!,
                {
                    avatar: allPhotoUrls[0] || ""
                },
                {
                    ...profile,
                    photoUrls: allPhotoUrls
                }
            )

            setFailedUploads([])
            setError("")
            setUploadProgress(null)
            setSuccess(true)

            setTimeout(() => {
                navigate('/vendeur/overview')
            }, 2000)

        } catch (error: any) {
            console.error("Erreur lors du retry:", error)
            const errorMessage = authService.getAuthError(error)

            setError(errorMessage || "Erreur lors du téléversement")
        } finally {
            setIsRetrying(false)
        }
    }

    const handleUpload = async () => {
        if (photoFiles.length === 0) {
            setError("Veuillez sélectionner au moins une photo")
            return
        }

        setLoading(true)
        setError("")
        setFailedUploads([])
        setUploadProgress({ current: 0, total: photoFiles.length })

        try {
            const uploadedUrls = await uploadService.uploadMultiple(
                photoFiles,
                token,
                undefined,
                undefined,
                (progress: { current: number; total: number }) => {
                    setUploadProgress({ current: progress.current, total: progress.total })
                }
            )

            const profile = user?.profile as Vendeur
            const allPhotoUrls = [...(profile?.photoUrls || []), ...uploadedUrls]

            await authService.updateUser(
                token,
                user?.id!,
                {
                    avatar: allPhotoUrls[0] || ""
                },
                {
                    ...profile,
                    photoUrls: allPhotoUrls
                }
            )

            setSuccess(true)
            setTimeout(() => {
                navigate('/vendeur/overview')
            }, 2000)

        } catch (error: any) {
            console.error("Erreur lors de l'upload:", error)
            setError(error.message || "Une erreur est survenue lors de l'upload")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/vendeur/register')}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <h1 className="text-base font-medium">Upload des photos</h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                                Étape 2/2
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4">
                {/* Progression */}
                <div className="bg-white rounded-xl border p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Photos de profil</h2>
                            <p className="text-sm text-gray-600">
                                Ajoutez des photos pour compléter votre profil
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-16 bg-primary rounded-full"></div>
                            <div className="h-2 w-16 bg-gray-200 rounded-full"></div>
                        </div>
                    </div>

                    <div className="text-sm text-gray-500">
                        <p>✓ La première photo sera utilisée comme photo principale</p>
                        <p>✓ Format accepté : PNG, JPG jusqu'à 5MB</p>
                        {photoPreviews.length > 0 && (
                            <p className="text-primary font-medium mt-2">
                                {photoPreviews.length} photo(s) sélectionnée(s)
                            </p>
                        )}
                    </div>
                </div>

                {/* Success */}
                {success && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <p className="text-green-800">
                                Toutes les photos ont été uploadées avec succès ! Redirection...
                            </p>
                        </div>
                    </div>
                )}

                {/* Erreur */}
                {error && (
                    <div className={`${failedUploads.length > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'} border p-4 rounded-lg mb-6`}>
                        <div className="flex items-start gap-3">
                            <AlertCircle className={`h-5 w-5 ${failedUploads.length > 0 ? 'text-yellow-600' : 'text-red-600'} mt-0.5 flex-shrink-0`} />
                            <div className="flex-1">
                                <p className={`${failedUploads.length > 0 ? 'text-yellow-800' : 'text-red-800'}`}>
                                    {error}
                                </p>
                                {failedUploads.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-3 items-center">
                                        <button
                                            type="button"
                                            onClick={handleRetry}
                                            disabled={isRetrying}
                                            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isRetrying ? (
                                                <>
                                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Upload en cours...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="h-4 w-4" />
                                                    Réessayer ({failedUploads.length} fichier{failedUploads.length > 1 ? 's' : ''})
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/vendeur/overview')}
                                            className="text-yellow-800 underline hover:text-yellow-900"
                                        >
                                            Ignorer et continuer
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        {failedUploads.length > 0 && (
                            <div className="mt-3 text-sm text-yellow-700">
                                <p className="font-medium">Photos échouées :</p>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    {failedUploads.map((fail, idx) => (
                                        <li key={idx}>
                                            <span className="font-mono text-xs">{fail.file.name}</span>
                                            <span className="text-gray-600"> - {fail.error}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Progression upload */}
                {uploadProgress && !success && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-800">
                                Téléversement des photos...
                            </span>
                            <span className="text-sm text-blue-600">
                                {uploadProgress.current} / {uploadProgress.total}
                            </span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2.5">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Upload area */}
                <div className="bg-white rounded-xl border p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900">
                            Mes photos ({photoPreviews.length})
                        </h3>

                        <button
                            onClick={handlePhotoUploadClick}
                            disabled={loading || success}
                            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50"
                        >
                            <Upload className="h-4 w-4" />
                            Ajouter des photos
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoChange}
                            className="hidden"
                            disabled={loading || success}
                        />
                    </div>

                    {photoPreviews.length === 0 ? (
                        <div className="text-center py-12">
                            <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 font-medium">Aucune photo sélectionnée</p>
                            <p className="text-sm text-gray-500 mt-1">Cliquez sur "Ajouter des photos" pour commencer</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {photoPreviews.map((url, index) => {
                                const hasFailed = failedUploads.some(f => f.index === index)
                                return (
                                    <div key={index} className="relative group">
                                        <div className={`h-40 rounded-lg overflow-hidden bg-gray-100 ${hasFailed ? 'ring-2 ring-yellow-500' : ''}`}>
                                            <img
                                                src={url}
                                                alt={`Photo ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            {hasFailed && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                    <AlertCircle className="h-8 w-8 text-yellow-500" />
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => removePhoto(index)}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                            disabled={loading || success}
                                            title="Supprimer"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>

                                        {index === 0 && !hasFailed && (
                                            <div className="absolute bottom-2 left-2 bg-primary text-white px-2 py-1 rounded text-xs">
                                                Principale
                                            </div>
                                        )}

                                        {hasFailed && (
                                            <div className="absolute bottom-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                                                Échec upload
                                            </div>
                                        )}
                                    </div>
                                )
                            })}

                            {/* Bouton pour ajouter plus de photos */}
                            {!loading && !success && (
                                <button
                                    onClick={handlePhotoUploadClick}
                                    className="h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary transition-colors"
                                >
                                    <Plus className="h-8 w-8 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-600">Ajouter</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Bouton d'upload final */}
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={loading || isRetrying || success || photoFiles.length === 0}
                        className={`bg-primary text-white px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${failedUploads.length > 0 ? 'bg-yellow-600 hover:bg-yellow-700' : 'hover:bg-primary/90'
                            }`}
                    >
                        {loading && !failedUploads.length ? (
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Upload en cours...
                            </div>
                        ) : isRetrying ? (
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Réessai en cours...
                            </div>
                        ) : failedUploads.length > 0 ? (
                            <div className="flex items-center gap-2">
                                <RefreshCw className="h-5 w-5" />
                                Réessayer les photos échouées
                            </div>
                        ) : success ? (
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                Upload terminé !
                            </div>
                        ) : (
                            "Terminer l'inscription"
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}