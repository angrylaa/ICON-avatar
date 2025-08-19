import { useNavigate } from "react-router";
import { logoutUser } from "services/user";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

export function Navbar() {
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role) {
      try {
        setRole(role);
      } catch {}
    }
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setRole(null);
    window.location.href = "/";
  };

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-[#CBB06A] shadow-md">
      <div className="flex items-center gap-6">
        {role === "admin" ? (
          <>
            <Button
              className="bg-[#B4933F] hover:bg-[#947627]"
              onClick={() => navigate("/admin")}
            >
              Admin Panel
            </Button>
            <Button
              className="bg-[#B4933F] hover:bg-[#947627]"
              onClick={() => navigate("/questionaire")}
            >
              Questionaire
            </Button>
          </>
        ) : (
          <Button
            className="bg-[#B4933F] hover:bg-[#947627]"
            onClick={() => navigate("/questionaire")}
          >
            Questionaire
          </Button>
        )}
      </div>
      <Button
        className="bg-[#B4933F] hover:bg-[#947627]"
        onClick={handleLogout}
      >
        Logout
      </Button>
    </nav>
  );
}
