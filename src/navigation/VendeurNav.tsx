import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/vendeur/overview/HomePage';
import VendeurLayout from '../layouts/vendeur/VendeurLayout';
import OffresPage from '../pages/vendeur/offres/OffresPage';
import NewOffrePage from '../pages/vendeur/offres/NewOffrePage';
import UpdateOffrePage from '../pages/vendeur/offres/UpdateOffrePage';
import OrdersPage from '../pages/vendeur/orders/OdersPage';
import ProfilePage from '../pages/vendeur/profile/ProfilePage';
import UploadPhotos from '../pages/auth/UploadPhotos';
import NotFoundPage from '../pages/public/NotFountPage';
import RetraitsPage from '../pages/vendeur/retraits/RetraitsPage';
import NewRetraitPage from '../pages/vendeur/retraits/NewRetraitPage';
import UpdateRetraitPage from '../pages/vendeur/retraits/UpdateRetraitPage';
import UserReclamationsPage from '../pages/user/ReclamationsPage';
import NewReclamationPage from '../pages/user/NewReclamationPage';
import UpdateReclamationPage from '../pages/user/UpdateReclamationPage';
import UserNotificationsPage from '../pages/user/NotificationsPage';
import UserNotificationDetailsPage from '../pages/user/NotificationDetailsPage';
import RetraitDetailsPage from '../pages/user/RetraitDetailsPage';


const MainRoutes = () => {
    return (
        <VendeurLayout>
            <Routes>

                <Route path="/overview" element={<HomePage />} />
                <Route path="/offres" element={<OffresPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/retraits" element={<RetraitsPage />} />
                <Route path="/retraits/details/:id" element={<RetraitDetailsPage />} />

                <Route path="/reclamations" element={<UserReclamationsPage />} />
                <Route path="/notifications" element={<UserNotificationsPage />} />
                <Route path="/notifications/details/:id" element={<UserNotificationDetailsPage />} />



                <Route path="*" element={<NotFoundPage />} />

            </Routes>
        </VendeurLayout>
    );
}
function VendeurNav() {

    return (
        <Routes>

            <Route path="/*" element={<MainRoutes />} />
            <Route path="/nouvelle-offre" element={<NewOffrePage />} />
            <Route path="/modifier-offre" element={<UpdateOffrePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/upload-photos" element={<UploadPhotos />} />

            <Route path="/nouveau-retrait" element={<NewRetraitPage />} />
            <Route path="/modifier-retrait/:id" element={<UpdateRetraitPage />} />

            <Route path="/reclamations/new" element={<NewReclamationPage />} />
            <Route path="/reclamations/:id/update" element={<UpdateReclamationPage />} />

        </Routes>
    );
}

export default VendeurNav;


