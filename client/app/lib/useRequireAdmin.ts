import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getMe } from "services/user";

export function useRequireAdmin() {
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function verify() {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/", { replace: true });
        return;
      }
      try {
        const { user } = await getMe();
        if (user.role !== "admin") {
          navigate("/", { replace: true });
          return;
        }
        setChecked(true);
      } catch {
        navigate("/", { replace: true });
      }
    }
    verify();
  }, [navigate]);

  return checked;
}