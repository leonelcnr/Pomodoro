import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../config/supabase";
import { TimerDisplay } from "../features/timer/components/TimerDisplay";
import { useTimerStore } from "../store/timerStore";
import { DataTable } from "@/components/data-table";
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
import { UserAuth } from "../services/AuthContexto";

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
    const authUser = UserAuth();
    const usuario = authUser.user;
    const setTimerState = useTimerStore((state) => state.setTimerState);

    // Para manejar los usuarios conectados a la sala
    const [usuariosEnSala, setUsuariosEnSala] = useState<any[]>([]);

    // Tareas
    const [tareas, setTareas] = useState<any[]>([]);
    const [taskTab, setTaskTab] = useState<"personal" | "room">("personal");

    useEffect(() => {
        if (!roomId || !usuario) return;

        // Limpiar el estado anterior si se cambia de sala (por seguridad)
        setUsuariosEnSala([]);

        const channel = supabase.channel(`room-${roomId}`, {
            config: {
                presence: {
                    key: usuario.id,
                },
            },
        });

        channel
            .on("presence", { event: "sync" }, () => {
                const state = channel.presenceState();
                // Extraer los usuarios únicos
                const users = Object.values(state).map((presenceInfo: any) => presenceInfo[0]);
                setUsuariosEnSala(users);
            })
            .subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    await channel.track({
                        id: usuario.id,
                        name: usuario.email?.split("@")[0] || "Usuario",
                        avatarUrl: usuario.avatar_url,
                    });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId, usuario]);

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

    // ---- Lógica de Tareas (Supabase) ----
    useEffect(() => {
        if (!roomId || !usuario) return;

        const cargarTareas = async () => {
            const { data, error } = await supabase
                .from("tasks")
                .select("*")
                .or(`room_id.eq.${roomId},and(room_id.is.null,user_id.eq.${usuario.id})`)
                .order("created_at", { ascending: false });

            if (!error && data) setTareas(data);
        };

        cargarTareas();

        // Suscribirse a Tareas de la Sala
        const channelTasks = supabase
            .channel("realtime-tasks")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "tasks",
                    filter: `room_id=eq.${roomId}`,
                },
                () => { cargarTareas(); }
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "tasks",
                    filter: `user_id=eq.${usuario.id}`,
                },
                () => { cargarTareas(); }
            )
            .subscribe();

        // Suscribirse a Cambios de la Sala (para el Reloj Compartido)
        const channelRoom = supabase
            .channel("realtime-room")
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "rooms",
                    filter: `id=eq.${roomId}`,
                },
                (payload) => {
                    if (payload.new && payload.new.timer_state) {
                        setTimerState(payload.new.timer_state);
                    }
                }
            )
            .subscribe();

        // Cargar estado inicial de la sala (reloj)
        const cargarClock = async () => {
            const { data } = await supabase.from("rooms").select("timer_state").eq("id", roomId).single();
            if (data?.timer_state) {
                setTimerState(data.timer_state);
            }
        };
        cargarClock();

        return () => {
            supabase.removeChannel(channelTasks);
            supabase.removeChannel(channelRoom);
        };
    }, [roomId, usuario]);

    const handleTasksChange = async (newTasksState: any[]) => {
        // Obtenemos qué tareas se crearon, modificaron o eliminaron comparando con `tareas`
        // Dado que DataTable maneja mutaciones locales, lo ideal es sincronizarlo.
        // Para simplicidad en esta demo interactiva de tabla, podríamos hacer un full-sync 
        // o depender de que DataTable llame funciones específicas (onDelete, onEdit, etc).
        // En nuestro caso en `data-table.tsx` hicimos un `onTasksChange` genérico que pisa
        // localmente, pero debemos guardar en BD cada cambio.

        // Por ahora, como DataTable edita el array entero, buscamos las diferencias:
        const newIds = new Set(newTasksState.map(t => t.id));

        // Determinar qué tareas pertenecen a la pestaña actual
        const currentTabTasks = taskTab === "personal"
            ? tareas.filter(t => t.room_id === null)
            : tareas.filter(t => t.room_id === roomId);

        // Tareas eliminadas: SOLO comparar con las de la pestaña actual
        const deletedTasks = currentTabTasks.filter(t => !newIds.has(t.id));
        for (const t of deletedTasks) {
            await supabase.from("tasks").delete().eq("id", t.id);
        }

        // Tareas añadidas o actualizadas
        for (const t of newTasksState) {
            const esPersonal = taskTab === "personal";

            const taskData: any = {
                user_id: usuario?.id,
                room_id: (t.room_id) ? t.room_id : (esPersonal ? null : roomId),
                header: t.header,
                type: t.type,
                status: t.status,
                priority: t.priority,
                favorite: t.favorite,
            };

            if (t.id && t.id < 1000000) {
                // Actualizar tarea existente
                const { error } = await supabase.from("tasks").update(taskData).eq("id", t.id);
                if (error) {
                    console.error("Supabase update error:", error);
                    alert(`Error al actualizar la tarea: ${error.message} (Detalles: ${error.details})`);
                }
            } else {
                // Insertar tarea nueva sin forzar ID manual, dejando a Supabase el control autoincremental
                const { error } = await supabase.from("tasks").insert([taskData]);
                if (error) {
                    console.error("Supabase insert error:", error);
                    alert(`Error al crear la tarea: ${error.message} (Detalles: ${error.details})`);
                }
            }
        }
    };

    const handleMoveTask = async (taskId: number) => {
        const task = tareas.find(t => t.id === taskId);
        if (!task) return;

        const newRoomId = task.room_id ? null : roomId;
        await supabase.from("tasks").update({ room_id: newRoomId }).eq("id", taskId);
    };

    const tareasMostradas = useMemo(() => {
        if (taskTab === "personal") {
            return tareas.filter(t => t.room_id === null);
        } else {
            return tareas.filter(t => t.room_id === roomId);
        }
    }, [tareas, taskTab, roomId]);


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
                {/* Indicador de usuarios en sala */}
                <div className="absolute -top-16 right-0 flex items-center gap-3 animate-in fade-in duration-700">
                    <div className="text-sm text-muted-foreground flex flex-col items-end">
                        <span className="font-medium text-foreground">En sala</span>
                        <span className="text-xs">{usuariosEnSala.length} {usuariosEnSala.length === 1 ? 'persona' : 'personas'}</span>
                    </div>
                    <AvatarGroup>
                        <TooltipProvider delayDuration={100}>
                            {usuariosEnSala.map((user) => (
                                <Tooltip key={user.id}>
                                    <TooltipTrigger asChild>
                                        <div className="relative cursor-help">
                                            <Avatar size="sm" className="ring-2 ring-background hover:ring-primary/50 transition-all">
                                                <AvatarImage src={user.avatarUrl} alt={user.name} />
                                                <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="z-50 text-xs font-medium">
                                        <p>{user.name}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </TooltipProvider>
                    </AvatarGroup>
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
                ) : (
                    <>
                        <div className="flex items-center justify-center border border-dashed rounded-3xl bg-card/10 w-full h-96">
                            <TimerDisplay link={linkInvitacion || ""} codigo={invitacion?.code || ""} roomId={roomId} />
                        </div>

                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 px-2">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1 mb-2">
                                    <h1 className="text-2xl font-bold tracking-tight">Tareas</h1>
                                    <p className="text-muted-foreground text-sm">
                                        Aquí tienes una lista de tus tareas de {taskTab === 'personal' ? 'forma personal' : 'sala'}.
                                    </p>
                                </div>
                                <div className="flex border-b border-border/50 mb-4">
                                    <button
                                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${taskTab === 'personal' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                                        onClick={() => setTaskTab("personal")}
                                    >
                                        Mis Tareas
                                    </button>
                                    <button
                                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${taskTab === 'room' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                                        onClick={() => setTaskTab("room")}
                                    >
                                        Tareas de la Sala
                                    </button>
                                </div>
                                <DataTable
                                    data={tareasMostradas}
                                    onTasksChange={handleTasksChange}
                                    onMoveTask={handleMoveTask}
                                    key={taskTab} // Forza un re-render del DataTable al cambiar de tab
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RoomPage;