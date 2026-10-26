import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/ui/Loader";

export default function ReferralLandingPage() {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const normalized = code.trim().toUpperCase();
    if (!/^[A-Z0-9-]{4,20}$/.test(normalized)) { navigate("/", { replace: true }); return; }
    const target = new URL("/register", import.meta.env.VITE_CABUNETS_URL || "https://cabunets.com");
    if (!["http:", "https:"].includes(target.protocol)) { navigate("/", { replace: true }); return; }
    target.searchParams.set("ref", normalized);
    window.location.replace(target.toString());
  }, [code, navigate]);
  return <Loader />;
}
