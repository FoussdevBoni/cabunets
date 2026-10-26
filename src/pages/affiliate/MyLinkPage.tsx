import { Link } from "react-router-dom";
// src/pages/affiliate/MyLinkPage.tsx

import { Copy, Check, Share2 } from "lucide-react";
import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { useMyAffiliateProfile } from "../../hooks/affiliates/useAffiliates";

export default function MyLinkPage() {
    const { profile, loading } = useMyAffiliateProfile();
    const [copied, setCopied] = useState<"link" | "code" | null>(null);

    const code = profile?.code ?? "";
    const link = code ? `${window.location.origin}/r/${code}` : "";

    const copy = async (text: string, type: "link" | "code") => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            console.error("Erreur copie :", err);
        }
    };

    const shareWhatsApp = () => {
        if (!link) return;
        const message = encodeURIComponent(
            `Rejoins Cabunets avec mon lien et profite des meilleurs tarifs sur les unités télécom ! ${link}`
        );
        window.open(`https://wa.me/?text=${message}`, "_blank");
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <SkeletonCard />
                <SkeletonCard />
            </div>
        );
    }

    if (!profile) {
        return (
            <EmptyState
                title="Vous n'êtes pas affilié"
                description="Rendez-vous dans Mon profil pour rejoindre le programme."
                action={<Link className="text-primary underline" to="/affiliate/profile">Mon profil</Link>}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Mon lien</h1>
                <p className="text-sm text-gray-600 mt-1">
                    Partagez votre lien unique et gagnez des commissions
                </p>
            </div>

            {/* Carte lien */}
            <Card padding="lg">
                <div className="space-y-6">
                    {/* Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mon code de parrainage
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                                <p className="text-lg font-bold text-primary tracking-wider">
                                    {code}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => copy(code, "code")}
                                icon={copied === "code" ? <Check size={16} /> : <Copy size={16} />}
                            >
                                {copied === "code" ? "Copié" : "Copier"}
                            </Button>
                        </div>
                    </div>

                    {/* Lien */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mon lien de parrainage
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 overflow-hidden">
                                <p className="text-sm text-gray-700 truncate">{link}</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => copy(link, "link")}
                                icon={copied === "link" ? <Check size={16} /> : <Copy size={16} />}
                            >
                                {copied === "link" ? "Copié" : "Copier"}
                            </Button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-100">
                        <Button
                            onClick={shareWhatsApp}
                            icon={<Share2 size={18} />}
                            fullWidth
                            size="lg"
                        >
                            Partager sur WhatsApp
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Instructions */}
            <Card>
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                    Comment utiliser mon lien ?
                </h3>
                <ol className="space-y-3">
                    {[
                        "Copiez votre lien ou votre code",
                        "Partagez-le à vos amis, familles ou clients",
                        "Ils s'inscrivent sur Cabunets avec votre lien",
                        "Vous gagnez une commission à chaque conversion admissible",
                    ].map((step, i) => (
                        <li key={i} className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                                {i + 1}
                            </span>
                            <span className="text-sm text-gray-700">{step}</span>
                        </li>
                    ))}
                </ol>
            </Card>
        </div>
    );
}