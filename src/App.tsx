import { Route, Routes, Navigate } from 'react-router-dom';
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
import ClientRegister from './pages/auth/RegisterPage';
import ClientNav from './navigation/ClientNav';
import TermsPage from './pages/public/TermsPage';
import PrivacyPage from './pages/public/PrivacyPage';
import MaintenancePage from './pages/public/MaintenancePage';

function App() {
  // ACTIVER LA MAINTENANCE : mettre à true
  // DÉSACTIVER LA MAINTENANCE : mettre à false
  const MAINTENANCE_MODE = false;

  // Initialiser le remplacement des alerts
  initCustomAlerts();

  useEffect(() => {
    setupErrorHandler();
  }, []);

  // Si mode maintenance actif, rediriger toutes les routes vers /maintenance
  if (MAINTENANCE_MODE) {
    return (
      <ErrorBoundary>
        <Routes>
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="*" element={<Navigate to="/maintenance" replace />} />
        </Routes>
      </ErrorBoundary>
    );
  }

  // Application normale (sans maintenance)
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/offres" element={<OffresPage />} />
        <Route path="/vendeur-details" element={<VendeurDetailsPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-pending" element={<OrderPendingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<ClientRegister />} />
        <Route path="/vendeur-register" element={<VendeurRegister />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/redirect" element={<Redirect />} />

        {/* Navigation Admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminNav />
            </ProtectedRoute>
          }
        />

        {/* Navigation Vendeur */}
        <Route
          path="/vendeur/*"
          element={
            <ProtectedRoute allowedRoles={['vendeur']}>
              <VendeurNav />
            </ProtectedRoute>
          }
        />

        {/* Navigation Client */}
        <Route
          path="/client/*"
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientNav />
            </ProtectedRoute>
          }
        />

        {/* Route 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;