// src/routes.tsx
import { createBrowserRouter } from "react-router-dom";
import AuthProviderLayout from "./layouts/AuthProviderLayout";
import HomeLayout from "./layouts/HomeLayout";
import AuthLayout from "./layouts/AuthLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Dashboard from "./pages/Dashboard";

export const router = createBrowserRouter([
    {
        element: <AuthProviderLayout />,
        children: [
            {
                element: <HomeLayout />,
                children: [{ path: "/", element: <Home /> }],
            },
            {
                element: <AuthLayout />,
                children: [{ path: "/login", element: <Login /> }],
            },
            {
                element: <AuthLayout />, //Aca va el layout de registro
                children: [{ path: "/registro", element: <Registro /> }],
            },
            {
                element: <HomeLayout />,
                children: [{ path: "/dashboard", element: <Dashboard /> }],
            },
        ],
    },
]);
