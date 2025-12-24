// src/layouts/AuthLayout.tsx
import { Outlet } from "react-router-dom";
import { ThemeTogglerButton } from "@/components/ui/theme-toggler";

const AuthLayout = () => {
    return (
        <div className="min-h-screen w-screen grid place-items-center bg-zinc-700 text-zinc-100 px-4">
            <div className="w-full max-w-md rounded-2xl bg-zinc-900/60 p-6 shadow">
                <Outlet />
            </div>
              <div className="absolute top-4 right-4">
            <ThemeTogglerButton />
        </div>
        </div>
    );
}

export default AuthLayout
