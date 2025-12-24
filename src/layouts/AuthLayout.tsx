// src/layouts/AuthLayout.tsx
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
    return (
        <div className="w-full h-full flex justify-center items-center">
            <div className="w-full h-full flex justify-center items-center">
                <Outlet />
            </div>
        </div>
    );
}

export default AuthLayout
