// src/layouts/AuthLayout.tsx
import { Outlet } from "react-router-dom";
import { ThemeTogglerButton } from "@/components/ui/theme-toggler";

const AuthLayout = () => {
    return (
        <div className="w-full h-full flex justify-center items-center">
            <div className="w-full h-full flex justify-center items-center">
                <Outlet />
            </div>
            <div className="absolute top-4 right-4">
                <ThemeTogglerButton />
            </div>
        </div>
    );
}

export default AuthLayout
