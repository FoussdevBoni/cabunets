import { Routes, Route, Navigate } from 'react-router-dom';

import AdminOverviewPage from '../pages/admin/OverViewPage';
import AdminOffresPage from '../pages/admin/OffresPage';
import OrdersPage from '../pages/admin/OrdersPage';
import AdminVendeursPage from '../pages/admin/VendeursPage';
import AdminLayout from '../layouts/admin/AdminLayout';
import DepositLookupPage from '../pages/admin/DepositLookupPage';
import AdminUsersPage from '../pages/admin/UsersPage';
import ClientsPage from '../pages/admin/ClientsPage';
import VendeurDetailsPage from '../pages/admin/VendeurDetailsPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';
import WalletsPage from '../pages/admin/WalletsPage';
import RetraitsPage from '../pages/admin/RetraitsPage';
import ReclamationsPage from '../pages/admin/ReclamationsPage';
import ReclamationsDetailsPage from '../pages/admin/ReclamationsDetailsPage';
import NotificationsPage from '../pages/admin/NotificationsPage';
import NewNotificationPage from '../pages/admin/NewNotificationPage';
import UpdateNotificationPage from '../pages/admin/UpdateNotificationPage';
import NewRetraitPage from '../pages/vendeur/NewRetraitPage';
import RetraitDetailsPage from '../pages/user/RetraitDetailsPage';


const MainRoutes = () => {
  return (
    <AdminLayout>
      <Routes>

        <Route path="/overview" element={<AdminOverviewPage />} />
        <Route path="/offres" element={<AdminOffresPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/vendeurs" element={<AdminVendeursPage />} />
        <Route path="/vendeurs/:id" element={<VendeurDetailsPage />} />

        <Route path="/deposit" element={<DepositLookupPage />} />
        <Route path="/users" element={<AdminUsersPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/settings" element={<AdminSettingsPage />} />
        <Route path="/wallets" element={<WalletsPage />} />
        <Route path="/retraits" element={<RetraitsPage />} />
        <Route path="/retraits/details/:id" element={<RetraitDetailsPage />} />
        <Route path="/reclamations" element={<ReclamationsPage />} />
        <Route path="/reclamations/details/:id" element={<ReclamationsDetailsPage />} />

        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/notifications/new" element={<NewNotificationPage />} />

        <Route path="/notifications/edit/:id" element={<UpdateNotificationPage />} />
        <Route path="/nouveau-retrait" element={<NewRetraitPage />} />

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


