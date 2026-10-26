import ReferralLandingPage from "./pages/public/ReferralLandingPage";
import { Routes, Route } from "react-router-dom";
import { AffiliateRoutes } from "./routes/AffiliateRoutes";
import { AdminRoutes } from "./routes/AdminRoutes";

import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import NotFoundPage from "./pages/public/NotFountPage";

import { RedirectIfAuthenticated } from "./wrappers/RedirectIfAuthenticated";
import RegisterPage from "./pages/auth/RegisterPage";
import Redirect from "./pages/auth/RedirectPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/r/:code" element={<ReferralLandingPage />} />
      <Route
        path="/auth/login"
        element={
          <RedirectIfAuthenticated>
            <LoginPage />
          </RedirectIfAuthenticated>
        }
      />
      <Route
        path="/auth/register"
        element={
          <RedirectIfAuthenticated>
            <RegisterPage />
          </RedirectIfAuthenticated>
        }
      />
      <Route
        path="/redirect"
        element={
          <Redirect />
        }
      />
      <Route
        path="/auth/forgot-password"
        element={
          <RedirectIfAuthenticated>
            <ForgotPasswordPage />
          </RedirectIfAuthenticated>
        }
      />

      <Route path="/affiliate/*" element={<AffiliateRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;