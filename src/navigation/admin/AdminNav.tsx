import { Routes, Route, Navigate } from 'react-router-dom';

import AdminOverviewPage from '../../pages/admin/overview/OverViewPage';
import AdminOffresPage from '../../pages/admin/offres/OffresPage';
import OrdersPage from '../../pages/admin/orders/OrdersPage';
import AdminVendeursPage from '../../pages/admin/vendeurs/VendeursPage';
import AdminLayout from '../../layouts/admin/AdminLayout';
import DepositLookupPage from '../../pages/admin/orders/DepositLookupPage';
import AdminUsersPage from '../../pages/admin/users/UsersPage';
import ClientsPage from '../../pages/admin/clients/ClientsPage';
import VendeurDetailsPage from '../../pages/admin/vendeurs/VendeurDetailsPage';
import AdminSettingsPage from '../../pages/admin/settings/AdminSettingsPage';
import WalletsPage from '../../pages/admin/wallets/WalletsPage';
import RetraitsPage from '../../pages/admin/retraits/RetraitsPage';
import ReclamationsPage from '../../pages/admin/reclamations/ReclamationsPage';
import ReclamationsDetailsPage from '../../pages/admin/reclamations/ReclamationsDetailsPage';
import NotificationsPage from '../../pages/admin/notifications/NotificationsPage';
import NewNotificationPage from '../../pages/admin/notifications/NewNotificationPage';
import UpdateNotificationPage from '../../pages/admin/notifications/UpdateNotificationPage';
import NewRetraitPage from '../../pages/vendeur/retraits/NewRetraitPage';
import RetraitDetailsPage from '../../pages/user/RetraitDetailsPage';
import VendeurDetailsNav from './VendeurDetailsNav';
import ManageUserPage from '../../pages/admin/users/ManageUserPage';


const MainRoutes = () => {
  return (
    <AdminLayout>
      <Routes>

        <Route path="/overview" element={<AdminOverviewPage />} />
        <Route path="/offres" element={<AdminOffresPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/vendeurs" element={<AdminVendeursPage />} />
        <Route path="/vendeurs/:id" element={<VendeurDetailsPage />} />
        <Route path="/vendeur-details/*" element={<VendeurDetailsNav />} />

        <Route path="/deposit" element={<DepositLookupPage />} />
        <Route path="/users" element={<AdminUsersPage />} />
        <Route path="/users/:id/manage" element={<ManageUserPage />} />

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


