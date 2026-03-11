// src/layouts/AuthProviderLayout.tsx
import { Outlet } from "react-router-dom";
import { AuthProvider } from "@/features/auth/context/AuthContext";

export default function AuthProviderLayout() {
    return (
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    );
}
