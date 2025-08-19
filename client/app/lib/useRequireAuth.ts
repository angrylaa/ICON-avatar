import { useEffect } from "react";
import { useNavigate } from "react-router";
import { getMe } from "services/user";

export function useRequireAuth(role?: string) {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
      return;
    }
    (async () => {
      try {
        const { user } = await getMe();
        if (role && user.role !== role) {
          navigate("/", { replace: true });
        }
      } catch {
        navigate("/", { replace: true });
      }
    })();
  }, [navigate, role]);
}
