import { Route, Routes } from 'react-router-dom'
import LoginPage from '../pages/auth/LoginPage'
import RedirectPage from '../pages/auth/RedirectPage'


export default function AuthNav() {
  return (
     <Routes>

          {/** Auth */}
        

           <Route path="/login" element={
              <LoginPage />
          } />
        

           

            <Route path="/redirect" element={
              <RedirectPage />
          } />

        
       

        </Routes>
  )
}
