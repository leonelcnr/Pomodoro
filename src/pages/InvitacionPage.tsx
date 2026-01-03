// src/pages/InvitePage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import supabase from "../config/supabase";
// si tenés AuthContext, mejor: import { useAuth } from "../context/Auth";

const Invitacion = () => {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        const run = async () => {
            const inviteCode = (code ?? "").trim().toUpperCase();
            if (!inviteCode) {
                setErrorMsg("Código inválido.");
                return;
            }

            // 1) chequeo sesión (si no hay login, mandar a login y volver)
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                const redirect = encodeURIComponent(`/invite/${inviteCode}`);
                navigate(`/login?redirect=${redirect}`, { replace: true, state: { from: location.pathname } });
                return;
            }

            // 2) unirse por RPC
            const { data: roomId, error } = await supabase.rpc("join_room", { p_code: inviteCode });
            if (error) {
                setErrorMsg(error.message || "No se pudo unir a la sala.");
                return;
            }

            // 3) entrar a la sala
            navigate(`/room/${roomId}`, { replace: true });
        };

        run();
    }, [code, navigate, location.pathname]);

    // UI simple (podés reemplazar por Card/Loader de shadcn)
    if (errorMsg) {
        return (
            <div className="p-6">
                <h1 className="text-xl font-semibold">No se pudo unir</h1>
                <p className="mt-2 opacity-80">{errorMsg}</p>
                <button
                    className="mt-4 rounded-md border px-4 py-2"
                    onClick={() => navigate("/home")}
                >
                    Volver al Home
                </button>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-xl font-semibold">Uniéndote a la sala…</h1>
            <p className="mt-2 opacity-80">Un segundo.</p>
        </div>
    );
}

export default Invitacion;
