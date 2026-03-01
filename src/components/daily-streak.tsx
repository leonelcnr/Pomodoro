import { useEffect, useState } from "react"
import { Flame } from "lucide-react"
import supabase from "@/config/supabase"
import { UserAuth } from "@/services/AuthContexto"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"

export function DailyStreak() {
    const { user } = UserAuth();
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        if (!user) return;

        const loadStreak = async () => {
            const { data, error } = await supabase
                .from("user_stats")
                .select("current_streak")
                .eq("user_id", user.id)
                .single();

            if (!error && data) {
                setStreak(data.current_streak || 0);
            }
        };

        loadStreak();

        // Escuchar cambios en tiempo real en la racha
        const channel = supabase
            .channel('realtime-streaks')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'user_stats', filter: `user_id=eq.${user.id}` },
                (payload) => {
                    setStreak(payload.new.current_streak);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Ocultar si la racha es 0 para mantener la interfaz limpia hasta que empiece a estudiar
    if (streak === 0) return null;

    return (
        <SidebarMenu className="mt-4">
            <SidebarMenuItem>
                <SidebarMenuButton
                    size="lg"
                    className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20 data-[state=open]:bg-orange-500/20"
                >
                    <div className="flex aspect-square size-8 items-center justify-center">
                        <Flame className="size-5 fill-current animate-pulse duration-3000" />
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none">
                        <span className="font-bold">{streak} Días</span>
                        <span className="text-[10px] font-medium opacity-80 uppercase tracking-wider">De Racha</span>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
