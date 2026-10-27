import SellersPage from "../pages/admin/SellersPage";
import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "../layouts/admin/AdminLayout";
import { RequireAuth } from "../wrappers/RequireAuth";

import AdminOverviewPage from "../pages/admin/OverviewPage";
import AdminAffiliatesPage from "../pages/admin/AffiliatesPage";
import AdminCommissionsPage from "../pages/admin/CommissionsPage";
import AdminWithdrawalsPage from "../pages/admin/WithdrawalsPage";
import AdminRulesPage from "../pages/admin/RulesPage";
import AdminAnomaliesPage from "../pages/admin/AnomaliesPage";
import AdminAuditPage from "../pages/admin/AuditPage";

export function AdminRoutes() {
  return (
    <Routes>
      <Route element={<RequireAuth role="admin" />}>
        <Route path="/" element={<AdminLayout />}>
          <Route path="overview" element={<AdminOverviewPage />} />
          <Route path="affiliates" element={<AdminAffiliatesPage />} />
          <Route path="commissions" element={<AdminCommissionsPage />} />
          <Route path="withdrawals" element={<AdminWithdrawalsPage />} />
          <Route path="sellers" element={<SellersPage />} />
          <Route path="rules" element={<AdminRulesPage />} />
          <Route path="anomalies" element={<AdminAnomaliesPage />} />
          <Route path="audit" element={<AdminAuditPage />} />
        </Route>
      </Route>
    </Routes>
  );
}