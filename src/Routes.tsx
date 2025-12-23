// src/routes.tsx
import { createBrowserRouter } from "react-router-dom";
import AuthProviderLayout from "./layouts/AuthProviderLayout";
import HomeLayout from "./layouts/HomeLayout";
import AuthLayout from "./layouts/AuthLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Dashboard from "./pages/Dashboard";
import { TimerDisplay } from "./features/timer/components/TimerDisplay";

export const router = createBrowserRouter([
    {
        element: <AuthProviderLayout />,
        children: [
            {
                element: <HomeLayout />,
                children: [
                    { path: "/", element: <Home /> },
                    { path: "/dashboard", element: <Dashboard /> },
                    { path: "/timer", element: <TimerDisplay /> },
                ],
            },
            {
                element: <AuthLayout />,
                children: [{ path: "/login", element: <Login /> },
                { path: "/registro", element: <Registro /> },
                ],
            },
        ],
    },
]);
