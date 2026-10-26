import VendeurDetailsTabLayout from '../../layouts/VendeurDetailsLayout'
import { Route, Routes } from 'react-router-dom'
import OverviewPage from '../../pages/vendeur/overview/HomePage'
import OffresPage from '../../pages/vendeur/offres/OffresPage'
import OrdersPage from '../../pages/vendeur/orders/OdersPage'
import RetraitsPage from '../../pages/admin/retraits/RetraitsPage'


export const OffresNav = () => {
  return (
    <Routes>

      <Route path="/:vendeurId" element={<OffresPage />} />
    </Routes>
  )
}


export const OrdersNav = () => {
  return (
    <Routes>

      <Route path="/:vendeurId" element={<OrdersPage />} />
    </Routes>
  )
}


export const RetraitsNav = () => {
  return (
    <Routes>

      <Route path="/:vendeurId" element={<RetraitsPage />} />
    </Routes>
  )
}

export default function VendeurDetailsNav() {
  return (
    <VendeurDetailsTabLayout>
      <Routes>
        <Route path="/overview/:vendeurId" element={<OverviewPage />} />
        <Route path="/offres/*" element={<OffresNav />} />
        <Route path="/orders/*" element={<OrdersNav />} />
        <Route path="/retraits/*" element={<RetraitsNav />} />
      </Routes>
    </VendeurDetailsTabLayout>
  )
}
