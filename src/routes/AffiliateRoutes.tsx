import { Routes, Route } from "react-router-dom";
import { AffiliateLayout } from "../layouts/affiliate/AffiliateLayout";
import { RequireAuth } from "../wrappers/RequireAuth";

import MyLinkPage from "../pages/affiliate/MyLinkPage";
import MyReferralsPage from "../pages/affiliate/MyReferralsPage";
import MyCommissionsPage from "../pages/affiliate/MyCommissionsPage";
import MyBalancePage from "../pages/affiliate/MyBalancePage";
import WithdrawalsPage from "../pages/affiliate/WithdrawalsPage";
import ProfilePage from "../pages/affiliate/ProfilePage";
import OverviewPage from "../pages/affiliate/OverviewPage";

export function AffiliateRoutes() {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route path="/" element={<AffiliateLayout />}>
          <Route path="overview" element={<OverviewPage />} />
          <Route path="my-link" element={<MyLinkPage />} />
          <Route path="my-referrals" element={<MyReferralsPage />} />
          <Route path="my-commissions" element={<MyCommissionsPage />} />
          <Route path="my-balance" element={<MyBalancePage />} />
          <Route path="withdrawals" element={<WithdrawalsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
}