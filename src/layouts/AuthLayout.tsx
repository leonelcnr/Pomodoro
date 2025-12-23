// src/layouts/AuthLayout.tsx
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
    return (
        <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-100 px-4">
            <div className="w-full max-w-md rounded-2xl bg-slate-900/60 p-6 shadow">
                <Outlet />
            </div>
        </div>
    );
}

export default AuthLayout
