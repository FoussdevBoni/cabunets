import { Routes, Route } from 'react-router-dom';

import NotFoundPage from '../pages/public/NotFountPage';
import ClientLayout from '../layouts/client/ClientLayout';
import ClientDashboardPage from '../pages/client/ClientDashboardPage';
import ClientOrdersPage from '../pages/client/OrdersPage';
import ClientProfilePage from '../pages/client/ClientProfilePage';
import ClientReclamationsPage from '../pages/user/ReclamationsPage';
import NewReclamationPage from '../pages/user/NewReclamationPage';
import UpdateReclamationPage from '../pages/user/UpdateReclamationPage';


const MainRoutes = () => {
    return (
        <ClientLayout>
            <Routes>

                <Route path="/overview" element={<ClientDashboardPage />} />
                <Route path="/achats" element={<ClientOrdersPage />} />
                <Route path="/profile" element={<ClientProfilePage />} />
                <Route path="/reclamations" element={<ClientReclamationsPage />} />


                <Route path="*" element={<NotFoundPage />} />

            </Routes>
        </ClientLayout>
    );
}
function ClientNav() {

    return (
        <Routes>

            <Route path="/*" element={<MainRoutes />} />
                <Route path="/reclamations/new" element={<NewReclamationPage />} />
                <Route path="/reclamations/:id/update" element={<UpdateReclamationPage />} />




        </Routes>
    );
}

export default ClientNav;


