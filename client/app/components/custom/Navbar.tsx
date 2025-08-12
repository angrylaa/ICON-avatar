import { useNavigate } from "react-router";
import { logoutUser } from "services/user";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

export function Navbar() {
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        setRole(user.role);
      } catch {}
    }
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-[#CBB06A] shadow-md">
      <Button
        className="bg-[#B4933F] hover:bg-[#947627]"
        onClick={handleLogout}
      >
        Logout
      </Button>
    </nav>
  );
}
