import { useState } from "react"
import {  useNavigate, useSearchParams } from "react-router-dom"
import { useOffre } from "../../hooks/offres/useOffre"
import useToken from "../../hooks/auth/useToken"
import { offresService } from "../../hooks/offres/useOffres"
import { Offre } from "../../utils/database"
import { useAuth } from "../../hooks/auth/useAuth"
import OffreForm from "../../components/common/forms/OffreForm"


export default function UpdateOffrePage() {
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id")
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const { offre, offreLoading } = useOffre({ offreId: id! })
    const { token } = useToken()
    const { user, loading } = useAuth()



    const handleSubmit = async (data: any) => {
        setIsLoading(true)
        try {
            const upadatedOffre: Offre = {
                ...data,
                vendeurId: user?.id
            }
            await offresService.update(id!, upadatedOffre, token)
            navigate("/offres")
        } finally {
            setIsLoading(false)
        }
    }

    if (!offre || offreLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <OffreForm
            initialData={offre}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            isUpdate={true}
        />
    )
}