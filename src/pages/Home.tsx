import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"

import { Separator } from "@/components/ui/separator"
import SalaNueva from "../features/home/components/SalaNueva"
import { useEffect, useState } from "react"
import supabase from "@/config/supabase"
import { UserAuth } from "@/services/AuthContexto"


const Home = () => {
    const authUser = UserAuth();
    const usuario = authUser.user;
    const [tareas, setTareas] = useState<any[]>([]);

    useEffect(() => {
        if (!usuario) return;

        const cargarTareas = async () => {
            const { data, error } = await supabase
                .from("tasks")
                .select("*")
                .eq("user_id", usuario.id)
                .is("room_id", null)
                .order("created_at", { ascending: false });

            if (!error && data) setTareas(data);
        };

        cargarTareas();

        // Suscribirse a Tareas Personales
        const channelTasks = supabase
            .channel("realtime-home-tasks")
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

        return () => {
            supabase.removeChannel(channelTasks);
        };
    }, [usuario]);

    const handleTasksChange = async (newTasksState: any[]) => {
        const newIds = new Set(newTasksState.map(t => t.id));

        // Tareas eliminadas: comparar contra nuestro estado local
        const deletedTasks = tareas.filter(t => !newIds.has(t.id));
        for (const t of deletedTasks) {
            await supabase.from("tasks").delete().eq("id", t.id);
        }

        // Tareas añadidas o actualizadas
        for (const t of newTasksState) {
            const taskData: any = {
                user_id: usuario?.id,
                room_id: null,
                header: t.header,
                type: t.type,
                status: t.status,
                priority: t.priority,
                favorite: t.favorite,
            };

            if (t.id && t.id < 1000000) {
                // Actualizar
                const { error } = await supabase.from("tasks").update(taskData).eq("id", t.id);
                if (error) {
                    console.error("Supabase update error:", error);
                    alert(`Error al actualizar la tarea: ${error.message} (Detalles: ${error.details})`);
                }
            } else {
                // Insertar nueva
                const { error } = await supabase.from("tasks").insert([taskData]);
                if (error) {
                    console.error("Supabase insert error:", error);
                    alert(`Error al crear la tarea: ${error.message} (Detalles: ${error.details})`);
                }
            }
        }
    };

    return (
        <>
            <SidebarProvider defaultOpen={false}
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)",
                    } as React.CSSProperties
                }
            >
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader />
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-0 ">
                            <div className="max-w-full h-full flex flex-col gap-4 px-4 py-4 md:px-6 md:py-6 lg:px-8">
                                <div className="w-full">
                                    <SalaNueva />
                                </div>

                                <Separator
                                    orientation="horizontal"
                                    className="my-4 data-[orientation=horizontal]:w-full"
                                />

                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1 mb-2">
                                        <h1 className="text-2xl font-bold tracking-tight">Tareas</h1>
                                        <p className="text-muted-foreground text-sm">
                                            Aquí tienes una lista de tus tareas.
                                        </p>
                                    </div>
                                    <DataTable data={tareas} onTasksChange={handleTasksChange} />
                                </div>
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    )
}

export default Home
