import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/auth/useAuth"
import OffreForm from "../../components/common/forms/OffreForm"
import useToken from "../../hooks/auth/useToken"
import { offresService } from "../../hooks/offres/useOffres"

export default function NewOffrePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const {token} = useToken()
  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      await offresService.create({
        ...data,
        vendeurId: user?.id,
        vendeurName: user?.username
      } , token)
      navigate("/offres")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <OffreForm
      onSubmit={handleSubmit}
      isLoading={isLoading}
      isUpdate={false}
    />
  )
}