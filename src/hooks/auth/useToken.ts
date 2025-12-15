import { useDispatch, useSelector } from "react-redux"
import { setUser } from "../../reducer/userSlice"

export default function useToken() {
  const dispatch = useDispatch()
  const userData = useSelector((state: any) => state.user.userData)

  const saveToken = (token: string) => {
    dispatch(setUser({ ...(userData || {}), token }))
  }

  return { token: userData?.token, saveToken }
}
