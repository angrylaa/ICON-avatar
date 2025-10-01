import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { logoutUser } from "services/user";
import { Toaster } from "sonner";
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
    <>
      {/* Fixed navbar container */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <nav className="flex items-center justify-between px-8 py-4 bg-[#CBB06A] shadow-lg rounded-2xl backdrop-blur-sm border border-[#B4933F]/20">
          <div className="flex items-center gap-6">
            {role === "admin" ? (
              <>
                <Button
                  className="bg-[#B4933F] hover:bg-[#947627] rounded-xl transition-all duration-200 hover:scale-105"
                  onClick={() => navigate("/admin")}
                >
                  Admin Panel
                </Button>
                <Button
                  className="bg-[#B4933F] hover:bg-[#947627] rounded-xl transition-all duration-200 hover:scale-105"
                  onClick={() => navigate("/questionaire")}
                >
                  Questionaire
                </Button>
              </>
            ) : (
              <Button
                className="bg-[#B4933F] hover:bg-[#947627] rounded-xl transition-all duration-200 hover:scale-105"
                onClick={() => navigate("/questionaire")}
              >
                Questionaire
              </Button>
            )}
          </div>
          <Button
            className="bg-[#B4933F] hover:bg-[#947627] rounded-xl transition-all duration-200 hover:scale-105"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </nav>
      </div>
      <Toaster />
    </>
  );
}
