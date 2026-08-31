// pages/vendeur/UpdateRetraitPage.tsx
import { useParams } from "react-router-dom";
import PageLitLayout from "../../layouts/PageListLayout";
import useRetraits from "../../hooks/retraits/useRetraits";
import RetraitForm from "../../components/features/retraits/RetraitForm";

export default function UpdateRetraitPage() {
  const { id } = useParams();
  const { data: retraits, loading } = useRetraits({});
  const retrait = retraits?.find(r => r.id === id || r._id === id);

  if (loading) {
    return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );
  }

  if (!retrait) {
    return (
      <div title="Modifier le retrait">
        <div className="px-6 py-8 max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Retrait non trouvé</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div title="Modifier le retrait">
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Modifier la demande de retrait</h1>
          <p className="text-sm text-gray-500 mt-1">Modifiez les informations ci-dessous</p>
        </div>
      </div>

      <div className="px-6 py-8 max-w-4xl mx-auto">
        <RetraitForm retrait={retrait} isEdit={true} />
      </div>
    </div>
  );
}