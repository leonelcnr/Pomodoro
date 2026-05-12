import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bar, BarChart, CartesianGrid, XAxis, PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import Heatmap from "@/components/ui/heatmap"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  minutes: {
    label: "Minutos",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig

// Formato estático fuera del componente para evitar re-renderizados de Heatmap
const formatMinutes = (m: number) => {
  if (!m) return "0m";
  if (m < 60) return `${Math.floor(m)}m`;
  return `${Math.floor(m / 60)}h ${Math.floor(m % 60)}m`;
};
const heatmapDateDisplayFunction = (d: Date) => new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }).format(d);

import { Clock, CheckCircle2, TrendingUp, Timer } from "lucide-react"
import { useEffect, useState, useRef, useMemo, startTransition } from "react"
import { useAuth } from "@/features/auth/context/AuthContext"
import { useDashboardStats, type TimeRange } from "@/features/dashboard/hooks/useDashboardStats"

export default function Dashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  
  const { 
    stats, 
    recentTasks, 
    chartData, 
    displayMinutes, 
    avgSessionMinutes, 
    displayCompletedTasks, 
    pieChartData, 
    heatmapData, 
    bestDaysData 
  } = useDashboardStats(user?.id, timeRange);

  // Fechas del Heatmap estáticas
  const heatmapDates = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setFullYear(end.getFullYear() - 1);
    return { start, end };
  }, []);

  const PIE_COLORS = ['#8b5cf6', '#f97316', '#10b981', '#3b82f6', '#ec4899', '#f43f5e', '#eab308'];

  const pieChartConfig = useMemo(() => {
    const config: Record<string, any> = {};
    pieChartData.forEach((entry, index) => {
      config[entry.name] = {
        label: entry.name,
        color: PIE_COLORS[index % PIE_COLORS.length],
      };
    });
    return config satisfies ChartConfig;
  }, [pieChartData]);

  const pieDataWithFill = useMemo(() => {
    return pieChartData.map((entry, index) => {
      return {
        ...entry,
        fill: PIE_COLORS[index % PIE_COLORS.length]
      }
    });
  }, [pieChartData]);

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
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full min-w-0">

          {/* Header & Global Time Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tu Momentum</h1>
              <p className="text-muted-foreground mt-1 text-sm">Resumen de tus bloques de enfoque y tareas completadas.</p>
            </div>
            <Tabs value={timeRange} onValueChange={(v: any) => startTransition(() => setTimeRange(v))} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-5 w-full sm:w-[400px]">
                <TabsTrigger value="day">Día</TabsTrigger>
                <TabsTrigger value="week">Semana</TabsTrigger>
                <TabsTrigger value="month">Mes</TabsTrigger>
                <TabsTrigger value="year">Año</TabsTrigger>
                <TabsTrigger value="total">Total</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Cards resumen */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full min-w-0">
            <Card className="bg-card shadow-none overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground line-clamp-1 break-all sm:break-normal">Tiempo de Concentración</CardTitle>
                <Clock className="h-4 w-4 text-violet-500 shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold truncate">{formatMinutes(displayMinutes)}</div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {timeRange === 'total' ? 'Total acumulado' : `En este periodo`}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-none overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground line-clamp-1 break-all sm:break-normal">Tareas Terminadas</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold truncate">{displayCompletedTasks}</div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  Tareas Terminadas
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-none overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground line-clamp-1 break-all sm:break-normal">Racha Actual</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-500 shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold truncate">{stats.currentStreak} {stats.currentStreak === 1 ? 'Día' : 'Días'}</div>
                <p className="text-xs text-muted-foreground mt-1 truncate">¡Sigue así!</p>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-none overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium text-muted-foreground line-clamp-1 break-all sm:break-normal">Enfoque Promedio</CardTitle>
                <Timer className="h-4 w-4 text-blue-500 shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold truncate">{formatMinutes(avgSessionMinutes)}</div>
                <p className="text-xs text-muted-foreground mt-1 truncate">Por sesión ({timeRange === 'total' ? 'histórico' : 'rango actual'})</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Gráfico Principal */}
            <Card className="col-span-1 lg:col-span-2 shadow-none border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="truncate">Flujo de Concentración</CardTitle>
                  <CardDescription>
                    Mostrando el tiempo de estudio en {timeRange === 'day' ? 'el día de hoy' : timeRange === 'week' ? 'la semana' : timeRange === 'month' ? 'el mes' : timeRange === 'year' ? 'el año' : 'total'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-2 sm:p-6">
                <ChartContainer
                  config={chartConfig}
                  className="aspect-auto h-[250px] w-full"
                >
                  <BarChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          className="w-[150px]"
                          nameKey="minutes"
                        />
                      }
                    />
                    <Bar dataKey="minutes" fill="var(--color-minutes)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Tareas por Categoría (Gráfico Circular) */}
            <Card className="bg-card shadow-none col-span-1 border">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Tareas por Categoría</CardTitle>
                <CardDescription className="text-xs">Distribución de tipos</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                {pieDataWithFill.length > 0 ? (
                  <ChartContainer
                    config={pieChartConfig}
                    className="mx-auto aspect-square max-h-[250px] w-full pb-0"
                  >
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Pie
                        data={pieDataWithFill}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                        stroke="var(--background)"
                        strokeWidth={2}
                      />
                      <ChartLegend
                        content={<ChartLegendContent nameKey="name" />}
                        className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                      />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground opacity-50">
                    <CheckCircle2 className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-sm">Aún no hay tareas</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lista de Tareas Recientes */}
            <Card className="bg-card shadow-none col-span-1 border">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Últimas Tareas Completadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500/80 shrink-0" />
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium line-through text-muted-foreground truncate">{task.header}</span>
                        <div className="flex items-center mt-0.5">
                           <span className="sr-only">Tipo de tarea: </span>
                           <span className="text-[10px] text-secondary-foreground bg-secondary px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-bold">{task.type}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {recentTasks.length === 0 && (
                    <div className="text-sm text-center text-muted-foreground py-6 flex flex-col items-center opacity-50">
                      <CheckCircle2 className="w-8 h-8 mb-2 opacity-50" />
                      Aún no hay tareas completadas.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Días más Productivos (Promedio histórico) */}
            <Card className="bg-card shadow-none col-span-1 md:col-span-2 border">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Días más Productivos</CardTitle>
                <CardDescription className="text-xs">Promedio histórico de enfoque por día (minutos)</CardDescription>
              </CardHeader>
              <CardContent className="px-2 sm:p-6">
                <ChartContainer
                  config={chartConfig}
                  className="aspect-auto h-[200px] w-full"
                >
                  <BarChart
                    accessibilityLayer
                    data={bestDaysData}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          className="w-[150px]"
                          nameKey="avgMinutes"
                        />
                      }
                    />
                    <Bar dataKey="avgMinutes" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Mapa de Calor */}
          <Card className="bg-card shadow-none border">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Actividad Anual</CardTitle>
              <CardDescription className="text-xs">Tiempo de concentración diario</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto pb-6">
              <div className="min-w-[800px] flex justify-center">
                <Heatmap
                  data={heatmapData}
                  startDate={heatmapDates.start}
                  endDate={heatmapDates.end}
                  colorMode="interpolate"
                  minColor="#e2e8f0"
                  maxColor="#8b5cf6"
                  cellSize={14}
                  gap={4}
                  valueDisplayFunction={formatMinutes}
                  dateDisplayFunction={heatmapDateDisplayFunction}
                />
              </div>
            </CardContent>
          </Card>

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
