
import { Route, Routes } from 'react-router-dom';
import AdminNav from './navigation/AdminNav';
import ProtectedRoute from './components/wrappers/ProtectedRoutes';
import VendeurNav from './navigation/VendeurNav';
import LandingPage from './pages/public/LandingPage';
import VendeurDetailsPage from './pages/public/VendeurDetailsPage';
import OffresPage from './pages/public/OffresPage';
import CheckoutPage from './pages/public/CheckoutPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import ServicesPage from './pages/public/ServicesPage';
import { useEffect } from 'react';
import { setupErrorHandler } from './utils/errorHandler';
import { ErrorBoundary } from './wrappers/ErrorBoundary';
import NotFoundPage from './pages/public/NotFountPage';
import LoginPage from './pages/auth/LoginPage';
import VendeurRegister from './pages/auth/VendeurRegister';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import Redirect from './pages/auth/RedirectPage';
import { initCustomAlerts } from './helpers/alertError';
import OrderPendingPage from './pages/public/OrderPendingPage';


function App() {

  // Initialiser le remplacement des alerts
  initCustomAlerts();

  useEffect(() => {
    setupErrorHandler()
  }, [])

  return (

    <ErrorBoundary>
      <Routes>




        <Route path="/" element={
          <LandingPage />
        } />
        <Route path="/offres" element={
          <OffresPage />
        } />
        <Route path="/vendeur-details" element={
          <VendeurDetailsPage />
        } />

        <Route path="/checkout" element={
          <CheckoutPage />
        } />

         <Route path="/order-pending" element={
          <OrderPendingPage />
        } />

        <Route path="/contact" element={
          <ContactPage />
        } />

        <Route path="/about" element={
          <AboutPage />
        } />
        <Route path="/services" element={
          <ServicesPage />
        } />

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
          <Redirect />
        } />

        {/**  Navigation Admin* */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminNav />
          </ProtectedRoute>
        } />

        {/**  Navigation vendeur* */}


        <Route path="/vendeur/*" element={
          <ProtectedRoute allowedRoles={['vendeur']}>
            <VendeurNav />
          </ProtectedRoute>
        } />



        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </ErrorBoundary>

  );
}

export default App;
