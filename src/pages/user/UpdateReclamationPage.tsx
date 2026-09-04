import { useParams } from 'react-router-dom';
import ReclamationForm from '../../components/features/reclamations/ReclamationForm';
import useReclamations from '../../hooks/reclamations/useReclamations';

export default function UpdateReclamationPage() {
 const { id } = useParams();
  const { data: reclamations, loading } = useReclamations({});
  const reclamation = reclamations?.find(r => r.id === id || r._id === id);

  if (loading) {
    return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );
  }

  if (!reclamation) {
    return (
      <div title="Modifier le reclamation">
        <div className="px-6 py-8 max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Réclamation non trouvée</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div title="Modifier le reclamation">
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Modifier la demande de réclamation</h1>
          <p className="text-sm text-gray-500 mt-1">Modifiez les informations ci-dessous</p>
        </div>
      </div>

      <div className="px-6 py-8 max-w-4xl mx-auto">
        <ReclamationForm reclamation={reclamation} isEdit={true} />
      </div>
    </div>
  );
}
