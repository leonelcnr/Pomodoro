// src/routes.tsx
import { createBrowserRouter } from "react-router-dom";
import AuthProviderLayout from "./layouts/AuthProviderLayout";
import HomeLayout from "./layouts/HomeLayout";
import AuthLayout from "./layouts/AuthLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/CalendarPage";
import { TimerDisplay } from "./features/timer/components/TimerDisplay";
import Invitacion from "./pages/InvitacionPage";
import Room from "./pages/RoomPage";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

export const router = createBrowserRouter([
    {
        element: <AuthProviderLayout />,
        children: [
            {
                element: <HomeLayout />,
                children: [
                    { index: true, element: <Home /> },
                    { path: "dashboard", element: <Dashboard /> },
                    { path: "calendar", element: <CalendarPage /> },
                    { path: "room/:roomId", element: <Room /> },
                ],
            },
            {
                element: <AuthLayout />,
                children: [
                    { path: "/login", element: <Login /> },
                    { path: "/registro", element: <Registro /> },
                ],
            },
            { path: "invitacion/:code", element: <Invitacion /> },
            { path: "terminos", element: <Terms /> },
            { path: "privacidad", element: <Privacy /> },
        ],
    },
]);
