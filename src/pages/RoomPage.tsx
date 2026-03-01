import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../config/supabase";
import { TimerDisplay } from "../features/timer/components/TimerDisplay";
import { DataTable } from "@/components/data-table";

import mockData from "./data.json";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
    const navigate = useNavigate();


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
        <div className="w-full min-h-dvh py-24 px-4 bg-background selection:bg-primary/20 overflow-x-hidden">
            <div className="max-w-6xl mx-auto space-y-24 relative">
                <div className="absolute -top-16 left-0">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Salir
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="sm:max-w-[425px]">
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Salir de la sala?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Volverás al inicio.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Mantenerse</AlertDialogCancel>
                                <AlertDialogAction onClick={() => navigate("/")}>
                                    Salir de la sala
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                {cargandoInvitacion ? (
                    <Empty className="w-full h-full flex flex-col items-center justify-center">
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
                ) : linkInvitacion ? (
                    <>
                        <div className="flex items-center justify-center border border-dashed rounded-3xl bg-card/10 w-full h-96">
                            <TimerDisplay link={linkInvitacion} codigo={invitacion?.code || ""} />
                        </div>

                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 px-2">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1 mb-2">
                                    <h1 className="text-2xl font-bold tracking-tight">Tareas</h1>
                                    <p className="text-muted-foreground text-sm">
                                        Aquí tienes una lista de tus tareas.
                                    </p>
                                </div>
                                <DataTable data={mockData} />
                            </div>
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