import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../config/supabase";
import { TimerDisplay } from "../features/timer/components/TimerDisplay";

type Invitacion = { // va en ingles porque asi quedo definido en el supabase
    code: string;
    expires_at: string | null;
    max_uses: number | null;
    uses: number;
    created_at: string;
};

function InvitacionValida(inv: Invitacion) {
    const noExpirada = !inv.expires_at || new Date(inv.expires_at).getTime() > Date.now();
    const tieneUsos = inv.max_uses == null || inv.uses < inv.max_uses;
    return noExpirada && tieneUsos;
}

const RoomPage = () => {
    const { roomId } = useParams();
    const [invitacion, setInvitacion] = useState<Invitacion | null>(null);
    const [cargandoInvitacion, setCargandoInvitacion] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        if (!roomId) return;

        const cargarInvitacion = async () => {
            setCargandoInvitacion(true);

            const { data, error } = await supabase
                .from("room_invites")
                .select("code, expires_at, max_uses, uses, created_at")
                .eq("room_id", roomId)
                .order("created_at", { ascending: false })
                .limit(1);

            setCargandoInvitacion(false);

            if (error) {
                console.error("Supabase error room_invites:", error);
                setError(error.message);
                setInvitacion(null);
                return;
            }

            const inv = data?.[0] ?? null;
            setInvitacion(inv && InvitacionValida(inv) ? inv : null);
            const { data: me } = await supabase.auth.getUser();
            console.log("mi uid:", me.user?.id);
        };

        cargarInvitacion();
    }, [roomId]);


    const linkInvitacion = useMemo(() => {
        if (!invitacion?.code) return null;
        return `${window.location.origin}/invitacion/${invitacion.code}`;
    }, [invitacion?.code]);


    return (
        <div>
            <h1>Sala {roomId}</h1>

            {cargandoInvitacion ? (<div>Cargando invitación…</div>) : linkInvitacion ? (
                <div>
                    <div>Código: <b>{invitacion?.code}</b></div>
                    <div>Link: <b>{linkInvitacion}</b></div>
                    <TimerDisplay />

                </div>
            ) : (
                <div>No hay invitación activa (o no tenés permiso para verla).</div>
            )}
        </div>
    );
};

export default RoomPage;