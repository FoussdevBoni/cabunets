import { useAuth } from '../hooks/auth/useAuth'





export default function ProfessionnelNav() {
    const { loading} = useAuth()
    if (loading) {
      return(
        null
      ) 
    }
  return (
   null
  )
}
