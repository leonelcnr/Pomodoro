import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Check, Loader2, Plus, Settings } from "lucide-react";
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
import { useCalendarEvents } from "@/features/calendar/useCalendarEvents";
import type { CalendarEvent, EventType } from "@/features/calendar/calendarService";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/context/AuthContext";

const EVENT_TYPE_COLOR: Record<EventType, string> = {
  Examen: "bg-red-500/15 text-red-400 border-red-500/30",
  Entrega: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Estudio: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Otro: "bg-muted text-muted-foreground border-border",
};

export default function CalendarPage() {
  const { user, connectGoogleCalendar, hasGoogleLinked } = useAuth();
  const hasCalendarToken = !!user?.provider_token;

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(undefined);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const { events, isLoading, createEvent, updateEvent, deleteEvent } = useCalendarEvents(
    hasGoogleLinked
  );

  const handleConnectGoogle = useCallback(async () => {
    setIsConnecting(true);
    try {
      await connectGoogleCalendar();
      // Flow redirects to /calendario — loading state auto-resolves
    } catch {
      setIsConnecting(false);
    }
  }, [connectGoogleCalendar]);

  // ── handlers ──────────────────────────────────────────────

  const handleSelectDate = useCallback((newDate: Date | undefined) => {
    setDate((prev) => {
      if (newDate && prev && newDate.toDateString() === prev.toDateString()) return prev;
      return newDate;
    });
  }, []);

  const handleDayDoubleClick = useCallback((day: Date, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedDay(day);
    setDate((prev) => {
      if (prev && day.toDateString() === prev.toDateString()) return prev;
      return day;
    });
    setIsDayDetailOpen(true);
  }, []);

  const handleAddEventFromDetail = () => {
    setIsDayDetailOpen(false);
    setIsAddEventOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsEditOpen(true);
    setIsDayDetailOpen(false);
  };

  // ── form submit callbacks ──────────────────────────────────

  const handleSubmitCreate = useCallback(
    async (values: { title: string; date: Date; type: EventType; description?: string }) => {
      await createEvent({
        title: values.title,
        event_date: format(values.date, "yyyy-MM-dd"),
        type: values.type,
        description: values.description,
      });
    },
    [createEvent]
  );

  const handleSubmitEdit = useCallback(
    async (
      values: { title: string; date: Date; type: EventType; description?: string },
      id?: string
    ) => {
      if (!id) return;
      await updateEvent(id, {
        title: values.title,
        event_date: format(values.date, "yyyy-MM-dd"),
        type: values.type,
        description: values.description,
      });
    },
    [updateEvent]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteEvent(id);
    },
    [deleteEvent]
  );

  // ── derived data ───────────────────────────────────────────

  const calendarWidget = useMemo(
    () => (
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleSelectDate}
        onDayDoubleClick={handleDayDoubleClick}
        className="rounded-md w-full h-full flex flex-col [&_.rdp-months]:w-full [&_.rdp-months]:flex-1 [&_.rdp-month]:w-full [&_.rdp-month]:flex-1 [&_table]:w-full [&_table]:flex-1 [&_tbody]:flex-1 [&_tbody]:flex [&_tbody]:flex-col [&_tr]:flex-1 [&_tr]:gap-2 [&_td]:flex-1 [&_.rdp-cell]:flex-1 [&_.rdp-button]:w-full [&_.rdp-button]:h-full [&_.rdp-button]:text-base"
      />
    ),
    [date, handleSelectDate, handleDayDoubleClick]
  );

  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    const dayStr = format(selectedDay, "yyyy-MM-dd");
    return events.filter((e) => e.event_date === dayStr);
  }, [selectedDay, events]);

  const upcomingEvents = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    return events.filter((e) => e.event_date >= todayStr).slice(0, 10);
  }, [events]);

  // ── render ─────────────────────────────────────────────────

  return (
    <SidebarProvider
      defaultOpen={false}
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
              <p className="text-muted-foreground mt-1 text-sm">
                Gestiona tus fechas importantes y exámenes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Ajustes de Calendario</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {hasCalendarToken ? (
                    <DropdownMenuItem disabled className="text-green-500 focus:text-green-500">
                      <Check className="mr-2 h-4 w-4" />
                      Google Calendar conectado
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={handleConnectGoogle}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CalendarIcon className="mr-2 h-4 w-4" />
                      )}
                      <div className="flex flex-col">
                        <span>Conectar Google Calendar</span>
                        <span className="text-xs text-muted-foreground">Sincroniza tus eventos automáticamente</span>
                      </div>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Add Event */}
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
                    <AddEventForm
                      onSuccess={() => setIsAddEventOpen(false)}
                      initialDate={date}
                      onSubmitEvent={handleSubmitCreate}
                    />
                  )}
                </DialogContent>
              </Dialog>

              {/* Edit Event */}
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Editar Evento</DialogTitle>
                    <DialogDescription>
                      Modifica los detalles del evento o elimínalo.
                    </DialogDescription>
                  </DialogHeader>
                  {isEditOpen && editingEvent && (
                    <AddEventForm
                      onSuccess={() => { setIsEditOpen(false); setEditingEvent(undefined); }}
                      event={editingEvent}
                      onSubmitEvent={handleSubmitEdit}
                      onDelete={handleDelete}
                    />
                  )}
                </DialogContent>
              </Dialog>

              {/* Day Detail */}
              <Dialog open={isDayDetailOpen} onOpenChange={setIsDayDetailOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      Eventos para el{" "}
                      {selectedDay?.toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </DialogTitle>
                    <DialogDescription>
                      Revisa los eventos programados para este día.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    {selectedDayEvents.length > 0 ? (
                      selectedDayEvents.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className="w-full text-left flex flex-col gap-1 border-l-2 border-primary pl-3 py-1 rounded-r-sm hover:bg-accent/50 transition-colors cursor-pointer"
                        >
                          <span className="text-sm font-medium">{event.title}</span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded border w-fit ${EVENT_TYPE_COLOR[event.type as EventType]}`}
                          >
                            {event.type}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No hay eventos programados.
                      </p>
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
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className="w-full text-left flex flex-col gap-1 border-l-2 border-primary pl-3 py-1 rounded-r-sm hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        <span className="text-sm font-medium line-clamp-1 truncate">
                          {event.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {new Date(event.event_date + "T00:00:00").toLocaleDateString("es-ES", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] py-0 px-1.5 h-4 ${EVENT_TYPE_COLOR[event.type as EventType]}`}
                          >
                            {event.type}
                          </Badge>
                        </div>
                      </button>
                    ))}
                    {upcomingEvents.length === 0 && (
                      <div className="text-sm text-center text-muted-foreground py-6">
                        No hay eventos próximos.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
