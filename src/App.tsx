
import AuthNav from './navigation/AuthNav';
import { Navigate, Route, Routes } from 'react-router-dom';
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


function App() {

  return (

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
      <Route path="/*" element={
        <AuthNav />
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



      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>

  );
}

export default App;
