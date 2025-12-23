// src/layouts/AuthProviderLayout.tsx
import { Outlet } from "react-router-dom";
import { AuthContextProvider } from "../services/AuthContexto";

export default function AuthProviderLayout() {
    return (
        <AuthContextProvider>
            <Outlet />
        </AuthContextProvider>
    );
}
