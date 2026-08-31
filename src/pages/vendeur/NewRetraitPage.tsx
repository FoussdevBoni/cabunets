// pages/vendeur/NewRetraitPage.tsx
import RetraitForm from "../../components/features/retraits/RetraitForm";

export default function NewRetraitPage() {
    return (
        <div title="Nouveau retrait">
            <div className="px-6 py-4 bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-900">Nouvelle demande de retrait</h1>
                    <p className="text-sm text-gray-500 mt-1">Remplissez le formulaire ci-dessous</p>
                </div>
            </div>

            <div className="px-6 py-8 max-w-4xl mx-auto">
                <RetraitForm />
            </div>
        </div>
    );
}