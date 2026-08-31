import { Routes, Route } from 'react-router-dom';

import NotFoundPage from '../pages/public/NotFountPage';
import ClientLayout from '../layouts/client/ClientLayout';
import ClientDashboardPage from '../pages/client/ClientDashboardPage';
import ClientOrdersPage from '../pages/client/OrdersPage';
import ClientProfilePage from '../pages/client/ClientProfilePage';


const MainRoutes = () => {
    return (
        <ClientLayout>
            <Routes>

                <Route path="/overview" element={<ClientDashboardPage />} />
                <Route path="/achats" element={<ClientOrdersPage />} />
                <Route path="/profile" element={<ClientProfilePage />} />


                <Route path="*" element={<NotFoundPage />} />

            </Routes>
        </ClientLayout>
    );
}
function ClientNav() {

    return (
        <Routes>

            <Route path="/*" element={<MainRoutes />} />
       
          


        </Routes>
    );
}

export default ClientNav;


