import { useEffect, useState } from "react"
import { Flame, Clock, CheckCircle2, TrendingUp } from "lucide-react"
import supabase from "@/config/supabase"
import { useAuth } from "@/features/auth/context/AuthContext"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

export function DailyStreak() {
    const { user } = useAuth();
    const [streak, setStreak] = useState(0);
    const [stats, setStats] = useState({ totalMinutes: 0, completedTasks: 0 });
    const [studiedToday, setStudiedToday] = useState(false);

    useEffect(() => {
        if (!user) return;

        const loadData = async () => {

            const { data, error } = await supabase
                .from("user_stats")
                .select("current_streak, total_study_minutes")
                .eq("user_id", user.id)
                .single();

            if (!error && data) {
                setStreak(data.current_streak || 0);
                setStats(prev => ({ ...prev, totalMinutes: data.total_study_minutes || 0 }));
            }

            const { count: tasksCount } = await supabase
                .from('tasks')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('status', 'Completada');
            setStats(prev => ({ ...prev, completedTasks: tasksCount || 0 }));

            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);
            const { data: todaySessions } = await supabase
                .from('study_sessions')
                .select('id')
                .eq('user_id', user.id)
                .gte('created_at', startOfToday.toISOString())
                .limit(1);
            setStudiedToday(todaySessions && todaySessions.length > 0 ? true : false);
        };

        loadData();

        const channel = supabase
            .channel('realtime-streaks-popover')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'user_stats', filter: `user_id=eq.${user.id}` },
                (payload) => {
                    setStreak(payload.new.current_streak);
                    setStats(prev => ({ ...prev, totalMinutes: payload.new.total_study_minutes || 0 }));
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'study_sessions', filter: `user_id=eq.${user.id}` },
                () => setStudiedToday(true)
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    if (streak === 0) return null;

    const formatMinutes = (m: number) => {
        if (m < 60) return `${m}m`;
        return `${Math.floor(m / 60)}h ${m % 60}m`;
    };

    const isGray = !studiedToday;
    const buttonColors = isGray
        ? "bg-muted hover:bg-muted/80 text-muted-foreground border-border data-[state=open]:bg-muted/80"
        : "bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border-orange-500/20 data-[state=open]:bg-orange-500/20";
    const fireColor = isGray ? "text-muted-foreground fill-current opacity-80" : "fill-current animate-pulse text-orange-500 duration-3000";

    return (
        <SidebarMenu className="mt-4">
            <SidebarMenuItem>
                <Popover>
                    <PopoverTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className={`border ${buttonColors}`}
                        >
                            <div className="flex aspect-square size-8 items-center justify-center">
                                <Flame className={`size-5 ${fireColor}`} />
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-bold">{streak} Días</span>
                                <span className="text-[10px] font-medium opacity-80 uppercase tracking-wider">De Racha</span>
                            </div>
                        </SidebarMenuButton>
                    </PopoverTrigger>
                    <PopoverContent side="right" align="start" className="w-64 p-4 mt-2 ml-2 bg-popover/95 backdrop-blur-md border-border shadow-xl rounded-xl">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 border-b border-border pb-3">
                                <div className={`flex items-center justify-center size-8 rounded-full ${isGray ? 'bg-muted' : 'bg-orange-500/10'}`}>
                                    <Flame className={`size-4 ${isGray ? 'text-muted-foreground' : 'text-orange-500'}`} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-foreground">Desempeño</span>
                                    <span className="text-xs text-muted-foreground">Tu progreso continuo</span>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <TrendingUp className="size-4 text-orange-500" />
                                        <span className="text-sm">Racha Actual</span>
                                    </div>
                                    <span className="text-sm font-bold text-foreground">{streak} {streak === 1 ? 'Día' : 'Días'}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="size-4 text-violet-500" />
                                        <span className="text-sm">Enfoque Total</span>
                                    </div>
                                    <span className="text-sm font-bold text-foreground">{formatMinutes(stats.totalMinutes)}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CheckCircle2 className="size-4 text-emerald-500" />
                                        <span className="text-sm">Tareas Terminadas</span>
                                    </div>
                                    <span className="text-sm font-bold text-foreground">{stats.completedTasks}</span>
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
