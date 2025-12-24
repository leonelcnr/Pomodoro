// src/layouts/AppLayout.tsx
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
const HomeLayout = () => {
    return (
        <div className="min-h-screen w-screen">
            <Header />
            <main className="mx-auto w-full max-w-5xl px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
}

export default HomeLayout

