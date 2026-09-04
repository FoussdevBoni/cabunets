import ReclamationForm from '../../components/features/reclamations/ReclamationForm'

export default function NewReclamationPage() {
  return (
    <div title="Nouvelle réclamation">
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle réclamation</h1>
          <p className="text-sm text-gray-500 mt-1">Remplissez le formulaire ci-dessous</p>
        </div>
      </div>

      <div className="px-6 py-8 max-w-4xl mx-auto">
        <ReclamationForm />
      </div>
    </div>
  )
}
