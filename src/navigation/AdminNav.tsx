import { Routes, Route, Navigate } from 'react-router-dom';

import AdminOverviewPage from '../pages/admin/OverViewPage';
import AdminOffresPage from '../pages/admin/OffresPage';
import OrdersPage from '../pages/admin/OrdersPage';
import AdminVendeursPage from '../pages/admin/VendeursPage';
import AdminLayout from '../layouts/admin/AdminLayout';


const MainRoutes = () => {
  return (
    <AdminLayout>
      <Routes>

        <Route path="/overview" element={<AdminOverviewPage />} />
        <Route path="/offres" element={<AdminOffresPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/vendeurs" element={<AdminVendeursPage />} />


        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </AdminLayout>
  );
}
function AdminNav() {

  return (
    <Routes>

      <Route path="/*" element={<MainRoutes />} />



    </Routes>
  );
}

export default AdminNav;


