import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Clock, CheckCircle2, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import { UserAuth } from "@/services/AuthContexto"
import supabase from "@/config/supabase"

export default function Dashboard() {
  const { user } = UserAuth();
  const [stats, setStats] = useState({ totalMinutes: 0, completedTasks: 0, currentStreak: 0 });
  const [chartData, setChartData] = useState<{ name: string, minutes: number }[]>([]);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      // 1. Cargar Estadísticas (Minutos totales y Racha)
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // 2. Cargar Tareas completadas (status = 'Completada')
      const { count: tasksCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'Completada');

      setStats({
        totalMinutes: userStats?.total_study_minutes || 0,
        currentStreak: userStats?.current_streak || 0,
        completedTasks: tasksCount || 0
      });

      // 3. Cargar Sesiones para el Gráfico (Últimos 7 días)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('duration_minutes, created_at')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      // Agrupar por día de la semana
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const aggregatedData = new Map();

      // Inicializar los últimos 7 días en 0
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        aggregatedData.set(days[d.getDay()], 0);
      }

      if (sessions) {
        for (const s of sessions) {
          const dayName = days[new Date(s.created_at).getDay()];
          const current = aggregatedData.get(dayName) || 0;
          aggregatedData.set(dayName, current + s.duration_minutes);
        }
      }

      const finalChartData = Array.from(aggregatedData, ([name, minutes]) => ({ name, minutes }));
      setChartData(finalChartData);

      // 4. Últimas tareas completadas
      const { data: recent, error: recentError } = await supabase
        .from('tasks')
        .select('id, header, type')
        .eq('user_id', user.id)
        .eq('status', 'Completada')
        .order('id', { ascending: false }) // Idealmente updated_at, pero si no existe usamos id (las ultimas agregadas)
        .limit(5);

      if (recentError) {
        console.error("Error fetching recent tasks:", recentError)
      }

      if (recent) setRecentTasks(recent);
    };

    loadDashboardData();

    // Suscribirse a cambios para que sea reactivo (tiempo real)
    const channelStats = supabase.channel('dashboard_stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_stats', filter: `user_id=eq.${user.id}` }, loadDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_sessions', filter: `user_id=eq.${user.id}` }, loadDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` }, loadDashboardData)
      .subscribe();

    return () => { supabase.removeChannel(channelStats); }
  }, [user]);

  // Formato para horas y minutos (ej: 12h 45m)
  const formatMinutes = (m: number) => {
    if (m < 60) return `${m}m`;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
  };

  return (
    <SidebarProvider defaultOpen={false}
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-6 p-6 max-w-6xl mx-auto w-full">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tu Momentum</h1>
            <p className="text-muted-foreground mt-1 text-sm">Resumen de tus bloques de enfoque y tareas completadas.</p>
          </div>

          {/* Cards resumen */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-zinc-900/50 border-zinc-800/60 shadow-none backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Tiempo de Concentración</CardTitle>
                <Clock className="h-4 w-4 text-violet-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatMinutes(stats.totalMinutes)}</div>
                <p className="text-xs text-zinc-500 mt-1">Total acumulado</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800/60 shadow-none backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Tareas Terminadas</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedTasks}</div>
                <p className="text-xs text-zinc-500 mt-1">Histórico</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800/60 shadow-none backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Racha Actual</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.currentStreak} {stats.currentStreak === 1 ? 'Día' : 'Días'}</div>
                <p className="text-xs text-zinc-500 mt-1">Sigue así</p>
              </CardContent>
            </Card>

            {/* Gráfico Principal */}
            <Card className="bg-zinc-900/50 border-zinc-800/60 shadow-none backdrop-blur-sm col-span-3 md:col-span-2">
              <CardHeader>
                <CardTitle>Flujo de los últimos 7 días</CardTitle>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        stroke="#52525b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#52525b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}m`}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                        itemStyle={{ color: '#e4e4e7' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="minutes"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorMin)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Tareas Recientes */}
            <Card className="bg-zinc-900/50 border-zinc-800/60 shadow-none backdrop-blur-sm col-span-3 md:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-zinc-300">Últimas Tareas Completadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500/80 shrink-0" />
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium line-through text-muted-foreground truncate">{task.header}</span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{task.type}</span>
                      </div>
                    </div>
                  ))}

                  {recentTasks.length === 0 && (
                    <div className="text-sm text-center text-muted-foreground py-6">
                      Aún no hay tareas completadas.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}