import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  type CalendarEvent,
  type CreateEventPayload,
  type UpdateEventPayload,
} from "./calendarService";
import { gcalCreate, gcalUpdate, gcalDelete } from "./googleCalendarService";

/** Generates a temporary client-side ID for optimistic inserts */
function tempId(): string {
  return `__optimistic_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

/**
 * Hook to manage calendar events with optional Google Calendar sync via Edge Function.
 *
 * @param hasGoogleLinked - Whether the user has a Google account linked for calendar sync.
 */
export function useCalendarEvents(
  hasGoogleLinked: boolean
) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Load on mount ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchEvents()
      .then((data) => { if (!cancelled) setEvents(data); })
      .catch((err) => {
        if (!cancelled) {
          console.error(err);
          toast.error("Error al cargar eventos");
        }
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // ── Create (optimistic) ────────────────────────────────────
  const handleCreate = useCallback(
    async (payload: CreateEventPayload): Promise<CalendarEvent | null> => {
      const oid = tempId();
      const optimisticEvent: CalendarEvent = {
        id: oid,
        user_id: "",
        title: payload.title,
        event_date: payload.event_date,
        type: payload.type,
        description: payload.description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 1. Optimistic insert
      setEvents((prev) =>
        [...prev, optimisticEvent].sort((a, b) =>
          a.event_date.localeCompare(b.event_date)
        )
      );

      const toastId = toast.loading("Guardando evento…", {
        description: payload.title,
      });

      // 3. Background: persist to Supabase + optional Google Calendar
      const backgroundWork = async (): Promise<CalendarEvent> => {
        const newEvent = await createEvent(payload);

        if (hasGoogleLinked) {
          try {
            const googleId = await gcalCreate({
              summary: newEvent.title,
              description: newEvent.type,
              date: newEvent.event_date,
            });
            const withGoogleId = await updateEvent(newEvent.id, {
              google_event_id: googleId,
            });
            
            setEvents((prev) =>
              prev
                .map((e) => (e.id === oid ? withGoogleId : e))
                .sort((a, b) => a.event_date.localeCompare(b.event_date))
            );
            return withGoogleId;
          } catch (gcalErr) {
            console.error("Google Calendar sync failed:", gcalErr);
            toast.error("Error en Google Calendar", { description: "Revisa la configuración." });
          }
        }

        // Replace optimistic entry with the real event
        setEvents((prev) =>
          prev
            .map((e) => (e.id === oid ? newEvent : e))
            .sort((a, b) => a.event_date.localeCompare(b.event_date))
        );
        return newEvent;
      };

      try {
        const result = await backgroundWork();
        const withGoogle = !!result.google_event_id;
        toast.success(
          withGoogle ? "Sincronizado con Google Calendar" : "Evento guardado",
          { id: toastId, description: result.title }
        );
        return result;
      } catch (err: unknown) {
        setEvents((prev) => prev.filter((e) => e.id !== oid));
        toast.error("No se pudo guardar el evento", {
          id: toastId,
          description: err instanceof Error ? err.message : undefined,
        });
        return null;
      }
    },
    [hasGoogleLinked]
  );

  // ── Update (optimistic) ────────────────────────────────────
  const handleUpdate = useCallback(
    async (id: string, payload: UpdateEventPayload): Promise<CalendarEvent | null> => {
      let snapshot: CalendarEvent | undefined;

      setEvents((prev) => {
        snapshot = prev.find((e) => e.id === id);
        return prev
          .map((e) =>
            e.id === id
              ? { ...e, ...payload, updated_at: new Date().toISOString() }
              : e
          )
          .sort((a, b) => a.event_date.localeCompare(b.event_date));
      });

      const toastId = toast.loading("Actualizando evento…");

      const backgroundWork = async (): Promise<CalendarEvent> => {
        const updated = await updateEvent(id, payload);

        if (hasGoogleLinked && updated.google_event_id) {
          try {
            await gcalUpdate(updated.google_event_id, {
              summary: updated.title,
              description: updated.type,
              date: updated.event_date,
            });
          } catch (gcalErr) {
            console.error("Google Calendar update failed:", gcalErr);
          }
        }

        setEvents((prev) =>
          prev
            .map((e) => (e.id === id ? updated : e))
            .sort((a, b) => a.event_date.localeCompare(b.event_date))
        );
        return updated;
      };

      try {
        const result = await backgroundWork();
        toast.success("Evento actualizado", { id: toastId });
        return result;
      } catch (err: unknown) {
        if (snapshot) {
          setEvents((prev) =>
            prev
              .map((e) => (e.id === id ? snapshot! : e))
              .sort((a, b) => a.event_date.localeCompare(b.event_date))
          );
        }
        toast.error("No se pudo actualizar el evento", {
          id: toastId,
          description: err instanceof Error ? err.message : undefined,
        });
        return null;
      }
    },
    [hasGoogleLinked]
  );

  // ── Delete (optimistic) ────────────────────────────────────
  const handleDelete = useCallback(
    async (id: string): Promise<boolean> => {
      let deletedEvent: CalendarEvent | undefined;

      setEvents((prev) => {
        deletedEvent = prev.find((e) => e.id === id);
        return prev.filter((e) => e.id !== id);
      });

      const toastId = toast.loading("Eliminando evento…");

      const backgroundWork = async (): Promise<void> => {
        if (hasGoogleLinked && deletedEvent?.google_event_id) {
          try {
            await gcalDelete(deletedEvent.google_event_id);
          } catch (gcalErr) {
            console.error("Google Calendar delete failed:", gcalErr);
          }
        }
        await deleteEvent(id);
      };

      try {
        await backgroundWork();
        toast.success("Evento eliminado", { id: toastId });
        return true;
      } catch (err: unknown) {
        if (deletedEvent) {
          setEvents((prev) =>
            [...prev, deletedEvent!].sort((a, b) =>
              a.event_date.localeCompare(b.event_date)
            )
          );
        }
        toast.error("No se pudo eliminar el evento", {
          id: toastId,
          description: err instanceof Error ? err.message : undefined,
        });
        return false;
      }
    },
    [hasGoogleLinked]
  );

  return {
    events,
    isLoading,
    createEvent: handleCreate,
    updateEvent: handleUpdate,
    deleteEvent: handleDelete,
  };
}
