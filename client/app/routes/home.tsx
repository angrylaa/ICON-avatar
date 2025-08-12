import type { Route } from "./+types/home";
import { LoginForm } from "~/components/custom/loginForm";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Try to get user role from localStorage if available
      const userRaw = localStorage.getItem("user");
      let role = null;
      if (userRaw) {
        try {
          const user = JSON.parse(userRaw);
          role = user.role;
        } catch {}
      }
      // Fallback: if no user info, default to questionaire
      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/questionaire", { replace: true });
      }
    }
  }, [navigate]);

  return (
    <div className="flex h-screen">
      <div className="w-1/2 h-full justify-center items-center flex">
        <div className="w-sm mx-auto flex flex-col gap-18">
          <img
            src="logo.png"
            alt="icon logo"
            className="w-42 mx-auto block dark:hidden"
          />
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-3xl font-bold text-[#B4933F]">
                Welcome to Your AI Avatar
              </div>
              <div className="text-3xl font-bold text-[#B4933F]">
                Sign into your account.
              </div>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="w-1/2 h-full bg-[#CBB06A]">
        <img
          src="home-img.svg"
          alt="home-page image"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
