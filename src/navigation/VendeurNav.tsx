import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/vendeur/HomePage';
import VendeurLayout from '../layouts/vendeur/VendeurLayout';
import OffresPage from '../pages/vendeur/OffresPage';
import NewOffrePage from '../pages/vendeur/NewOffrePage';
import UpdateOffrePage from '../pages/vendeur/UpdateOffrePage';
import OrdersPage from '../pages/vendeur/OdersPage';
import ProfilePage from '../pages/vendeur/ProfilePage';
import UploadPhotos from '../pages/auth/UploadPhotos';
import NotFoundPage from '../pages/public/NotFountPage';


const MainRoutes = () => {
    return (
        <VendeurLayout>
            <Routes>

                <Route path="/overview" element={<HomePage />} />
                <Route path="/offres" element={<OffresPage />} />
                <Route path="/orders" element={<OrdersPage />} />


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


        </Routes>
    );
}

export default VendeurNav;


