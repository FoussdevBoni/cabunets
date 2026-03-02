import { Route, Routes } from 'react-router-dom'
import LoginPage from '../pages/auth/LoginPage'
import RedirectPage from '../pages/auth/RedirectPage'
import VendeurRegister from '../pages/auth/VendeurRegister'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'


export default function AuthNav() {
  return (
     <Routes>

          {/** Auth */}
        

           <Route path="/login" element={
              <LoginPage />
          } />
           <Route path="/vendeur-register" element={
              <VendeurRegister />
          } />
             <Route path="/forgot-password" element={
              <ForgotPasswordPage />
          } />
        
        

           

            <Route path="/redirect" element={
              <RedirectPage />
          } />

        
       

        </Routes>
  )
}
