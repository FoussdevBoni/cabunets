import { useAuth } from '../hooks/auth/useAuth'



export default function AdminNav() {
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
