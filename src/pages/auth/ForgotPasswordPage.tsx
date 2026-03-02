import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    Mail,
    Key,
    ArrowLeft,
    CheckCircle,
    Loader2,
    Shield,
    Eye,
    EyeOff
} from "lucide-react"
import { authService } from "../../services/authService"

export default function ForgotPasswordPage() {
    const navigate = useNavigate()
    const [step, setStep] = useState<"email" | "code" | "success">("email")
    const [loading, setLoading] = useState(false)

    // États pour afficher/masquer les mots de passe
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const [form, setForm] = useState({
        email: "",
        code: "",
        newPassword: "",
        confirmPassword: ""
    })

    const [errors, setErrors] = useState({
        email: "",
        code: "",
        newPassword: "",
        confirmPassword: ""
    })

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({ email: "", code: "", newPassword: "", confirmPassword: "" })

        if (!form.email) {
            setErrors(prev => ({ ...prev, email: "L'email est requis" }))
            return
        }

        if (!form.email.includes('@')) {
            setErrors(prev => ({ ...prev, email: "Email invalide" }))
            return
        }

        setLoading(true)
        await authService.requestPasswordReset(form.email)
        setLoading(false)
        setStep("code")
    }

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({ email: "", code: "", newPassword: "", confirmPassword: "" })

        if (!form.code) {
            setErrors(prev => ({ ...prev, code: "Le code est requis" }))
            return
        }

        if (form.code.length !== 6) {
            setErrors(prev => ({ ...prev, code: "Le code doit contenir 6 chiffres" }))
            return
        }

        if (!form.newPassword) {
            setErrors(prev => ({ ...prev, newPassword: "Le mot de passe est requis" }))
            return
        }

        if (form.newPassword.length < 6) {
            setErrors(prev => ({ ...prev, newPassword: "Minimum 6 caractères" }))
            return
        }

        if (form.newPassword !== form.confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: "Les mots de passe ne correspondent pas" }))
            return
        }

        setLoading(true)
        await authService.resetPasswordWithOtp(form.email, form.code, form.newPassword)

        setLoading(false)
        setStep("success")
    }

    const resendCode = async () => {
        if (!form.email) {
            setErrors(prev => ({ ...prev, email: "L'email est requis" }))
            return
        }

        if (!form.email.includes('@')) {
            setErrors(prev => ({ ...prev, email: "Email invalide" }))
            return
        }
        setLoading(true)
        if (form.email) {
            await authService.requestPasswordReset(form.email)

            setLoading(false)
            alert("Nouveau code envoyé à votre email")
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b">
                <div className="max-w-md mx-auto px-4 py-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h1 className="text-base font-medium">
                            {step === "email" ? "Mot de passe oublié" :
                                step === "code" ? "Vérification" :
                                    "Réinitialisation réussie"}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto p-4">
                {/* Logo */}
                <div className="text-center mb-8 pt-8">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Shield className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {step === "email" ? "Réinitialiser votre mot de passe" :
                            step === "code" ? "Vérifiez votre email" :
                                "Mot de passe modifié"}
                    </h2>
                    <p className="text-gray-600">
                        {step === "email" ? "Entrez votre email pour recevoir un code de vérification" :
                            step === "code" ? "Entrez le code reçu et votre nouveau mot de passe" :
                                "Votre mot de passe a été modifié avec succès"}
                    </p>
                </div>

                {/* Étape 1 : Email */}
                {step === "email" && (
                    <form onSubmit={handleSendCode} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Adresse email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                                    className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition ${errors.email ? "border-red-300" : "border-gray-300"
                                        }`}
                                    placeholder="votre@email.com"
                                    autoComplete="email"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Envoi en cours...
                                </div>
                            ) : (
                                "Envoyer le code"
                            )}
                        </button>
                    </form>
                )}

                {/* Étape 2 : Code + Nouveau mot de passe */}
                {step === "code" && (
                    <form onSubmit={handleVerifyCode} className="space-y-6">
                        {/* Code de vérification */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Code de vérification
                            </label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    value={form.code}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '')
                                        setForm(prev => ({ ...prev, code: value.slice(0, 6) }))
                                    }}
                                    className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition text-center text-xl tracking-widest ${errors.code ? "border-red-300" : "border-gray-300"
                                        }`}
                                    placeholder="000000"
                                    autoComplete="one-time-code"
                                />
                            </div>
                            {errors.code && (
                                <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                            )}
                            <p className="mt-2 text-sm text-gray-500">
                                Code à 6 chiffres envoyé à {form.email}
                            </p>

                            <div className="mt-4 text-center">
                                <button
                                    type="button"
                                    onClick={resendCode}
                                    disabled={loading}
                                    className="text-primary hover:text-primary/80 text-sm font-medium"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-1">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Envoi...
                                        </span>
                                    ) : (
                                        "Renvoyer le code"
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Nouveau mot de passe */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nouveau mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={form.newPassword}
                                    onChange={(e) => setForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition pr-10 ${errors.newPassword ? "border-red-300" : "border-gray-300"
                                        }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {errors.newPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                            )}
                        </div>

                        {/* Confirmer le mot de passe */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirmer le mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition pr-10 ${errors.confirmPassword ? "border-red-300" : "border-gray-300"
                                        }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Vérification...
                                </div>
                            ) : (
                                "Réinitialiser le mot de passe"
                            )}
                        </button>
                    </form>
                )}

                {/* Étape 3 : Succès */}
                {step === "success" && (
                    <div className="text-center space-y-6">
                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-gray-900">Mot de passe modifié !</h3>
                            <p className="text-gray-600">
                                Votre mot de passe a été réinitialisé avec succès.
                            </p>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={() => navigate("/login")}
                                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition"
                            >
                                Se connecter
                            </button>
                        </div>
                    </div>
                )}

                {/* Retour à la connexion */}
                {step !== "success" && (
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => navigate("/login")}
                            className="text-primary hover:text-primary/80 font-medium"
                        >
                            ← Retour à la connexion
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}