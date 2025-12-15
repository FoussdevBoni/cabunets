
import AuthNav from './navigation/AuthNav';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminNav from './navigation/AdminNav';
import WaitingForValidationPage from './pages/public/WaitingForValidationPage';
import ProtectedRoute from './components/wrappers/ProtectedRoutes';
import VendeurNav from './navigation/VendeurNav';


function App() {

  return (

    <Routes>




      <Route path="/waiting" element={
        <WaitingForValidationPage />
      } />

      {/** Auth */}
      <Route path="/*" element={
        <AuthNav />
      } />

      {/**  Navigation Admin* */}
      <Route path="/admin/*" element={
        <AdminNav />
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
