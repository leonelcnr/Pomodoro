import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useState, useCallback, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddEventForm } from "@/features/calendar/components/AddEventForm";

const mockEvents = [{
  id: 1,
  title: "Examen de Matemáticas",
  date: new Date(),
  type: "Examen"
}, {
  id: 2,
  title: "Entrega de Proyecto",
  date: new Date(),
  type: "Entrega"
}];


export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const proximamente = true;
  // Mock events for the initial UI state

  const handleSelectDate = useCallback((newDate: Date | undefined) => {
    setDate(prev => {
      if (newDate && prev && newDate.toDateString() === prev.toDateString()) {
        return prev;
      }
      return newDate;
    });
  }, []);

  const handleDayDoubleClick = useCallback((day: Date, e: React.MouseEvent) => {
    e.preventDefault();

    setSelectedDay(day);
    setDate(prev => {
      if (prev && day.toDateString() === prev.toDateString()) return prev;
      return day;
    });
    setIsDayDetailOpen(true);
  }, []);

  const calendarWidget = useMemo(() => (
    <Calendar
      mode="single"
      selected={date}
      onSelect={handleSelectDate}
      onDayDoubleClick={handleDayDoubleClick}
      className="rounded-md w-full h-full flex flex-col [&_.rdp-months]:w-full [&_.rdp-months]:flex-1 [&_.rdp-month]:w-full [&_.rdp-month]:flex-1 [&_table]:w-full [&_table]:flex-1 [&_tbody]:flex-1 [&_tbody]:flex [&_tbody]:flex-col [&_tr]:flex-1 [&_tr]:gap-2 [&_td]:flex-1 [&_.rdp-cell]:flex-1 [&_.rdp-button]:w-full [&_.rdp-button]:h-full [&_.rdp-button]:text-base"
    />
  ), [date, handleSelectDate, handleDayDoubleClick]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    return mockEvents.filter(event => event.date.toDateString() === selectedDay.toDateString());
  }, [selectedDay]);

  const handleAddEventFromDetail = () => {
    setIsDayDetailOpen(false);
    setIsAddEventOpen(true);
  };

  if (proximamente) {
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
          <div className="flex items-center justify-start flex-1 flex-col gap-6 md:p-6 lg:p-8 max-w-6xl mx-auto w-full min-w-0">
            <h1 className="text-3xl font-bold tracking-tight">Proximamente</h1>
            <p className="text-muted-foreground mt-1 text-sm">Estamos trabajando en ello...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

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

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
              <p className="text-muted-foreground mt-1 text-sm">Gestiona tus fechas importantes y exámenes.</p>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Ajustes de Calendario</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>Conectar Google Calendar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir Fecha
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Añadir Fecha</DialogTitle>
                    <DialogDescription>
                      Rellena los detalles para añadir un evento o examen a tu calendario.
                    </DialogDescription>
                  </DialogHeader>
                  {isAddEventOpen && (
                    <AddEventForm onSuccess={() => setIsAddEventOpen(false)} initialDate={date} />
                  )}
                </DialogContent>
              </Dialog>

              <Dialog open={isDayDetailOpen} onOpenChange={setIsDayDetailOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      Eventos para el {selectedDay?.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </DialogTitle>
                    <DialogDescription>
                      Revisa los eventos programados para este día.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {selectedDayEvents.length > 0 ? (
                      selectedDayEvents.map(event => (
                        <div key={event.id} className="flex flex-col gap-1 border-l-2 border-primary pl-3">
                          <span className="text-sm font-medium">{event.title}</span>
                          <span className="text-xs text-muted-foreground">{event.type}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No hay eventos programados.</p>
                    )}
                  </div>
                  <div className="flex justify-end pt-4 border-t border-border">
                    <Button onClick={handleAddEventFromDetail}>
                      <Plus className="mr-2 h-4 w-4" />
                      Añadir Nuevo Evento a este Día
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-12 w-full min-w-0">
            {/* Calendar Widget */}
            <Card className="bg-card shadow-none md:col-span-8 lg:col-span-8 overflow-hidden flex flex-col p-4 w-full">
              {calendarWidget}
            </Card>

            {/* Upcoming Events List */}
            <Card className="bg-card shadow-none md:col-span-4 lg:col-span-4 overflow-y-auto h-full">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEvents.map(event => (
                    <div key={event.id} className="flex flex-col gap-1 border-l-2 border-primary pl-3">
                      <span className="text-sm font-medium line-clamp-1 truncate">{event.title}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {event.date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}

                  {mockEvents.length === 0 && (
                    <div className="text-sm text-center text-muted-foreground py-6">
                      No hay eventos próximos.
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
