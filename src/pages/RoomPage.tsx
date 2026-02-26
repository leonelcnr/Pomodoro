import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../config/supabase";
import { TimerDisplay } from "../features/timer/components/TimerDisplay";
import { DataTable } from "@/components/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import mockData from "./data.json";

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
    const [invitacion, setInvitacion] = useState<Invitacion | null>();
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
        <div className="w-full min-h-dvh py-26 px-4 bg-background selection:bg-primary/20">
            <div className="max-w-6xl mx-auto space-y-24">
                {cargandoInvitacion ? (
                    <div className="flex items-center justify-center py-40 text-muted-foreground animate-pulse font-mono tracking-widest uppercase">
                        Cargando invitación…
                    </div>
                ) : linkInvitacion ? (
                    <>
                        <div className="flex items-center justify-center border border-dashed rounded-3xl bg-card/10 w-full h-96">
                            <TimerDisplay link={linkInvitacion} codigo={invitacion?.code || ""} />
                        </div>

                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-3xl font-bold tracking-tight">Tareas</h2>
                            </div>

                            <Tabs defaultValue="personal" className="w-full">
                                <div className="flex items-center justify-between mb-6 px-1">
                                    <TabsList className="bg-muted/50 p-1">
                                        <TabsTrigger value="personal" className="px-6 py-2 data-[state=active]:bg-background">
                                            Mis Tareas
                                        </TabsTrigger>
                                        <TabsTrigger value="room" className="px-6 py-2 data-[state=active]:bg-background">
                                            Tareas de la Sala
                                        </TabsTrigger>
                                    </TabsList>
                                </div>
                                <TabsContent value="personal" className="mt-0 border-none p-0 outline-none">
                                    <DataTable data={mockData.slice(0, 5)} />
                                </TabsContent>
                                <TabsContent value="room" className="mt-0 border-none p-0 outline-none">
                                    <DataTable data={mockData.slice(5, 12)} />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center py-40 text-muted-foreground border border-dashed rounded-3xl bg-card/10">
                        {error ? `Error: ${error}` : "No hay invitación activa (o no tenés permiso para verla)."}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomPage;