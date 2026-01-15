import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../config/supabase";
import { Button } from "@/components/ui/button"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"

const Invitacion = () => {
    const { code } = useParams<{ code: string }>();
    const navigate = useNavigate();
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
                const redirect = encodeURIComponent(`/invitacion/${inviteCode}`);
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
            <Empty className="w-full h-screen flex flex-col items-center justify-center">
                <EmptyHeader>
                    <EmptyTitle>Error</EmptyTitle>
                    <EmptyDescription>
                        {errorMsg}
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                        Volver al inicio
                    </Button>
                </EmptyContent>
            </Empty>
        );
    }

    return (
        <Empty className="w-full h-screen flex flex-col items-center justify-center">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Spinner />
                </EmptyMedia>
                <EmptyTitle>Procesando tu invitación...</EmptyTitle>
                <EmptyDescription>
                    Por favor espera mientras procesamos tu invitación. No recargues la página.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                    Cancelar
                </Button>
            </EmptyContent>
        </Empty>
    );
}

export default Invitacion;
