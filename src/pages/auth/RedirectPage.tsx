import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../../services/authService";
import Loader from "../../components/ui/Loader";
import { User } from "../../utils/database";

export default function Redirect() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!token) {
          navigate("/login");
          return;
        }

        const currentUser : User | null = await authService.getUserProfile(token);
        
        if (currentUser) {
          navigate(`/${currentUser.role}/overview`);
        } else {
          navigate("/login");
        }
      } catch (err) {
        navigate("/login");

       console.error(err)

      }
    };

    fetchUser();
  }, [token, navigate]);

  return <Loader />;
}
