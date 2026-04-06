import supabase from "@/lib/supabase";

export type EventType = "Examen" | "Entrega" | "Estudio" | "Otro";

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  event_date: string; // ISO date string "YYYY-MM-DD"
  type: EventType;
  description?: string;
  google_event_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEventPayload {
  title: string;
  event_date: string;
  type: EventType;
  description?: string;
}

export interface UpdateEventPayload {
  title?: string;
  event_date?: string;
  type?: EventType;
  description?: string;
  google_event_id?: string;
}

export async function fetchEvents(): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createEvent(
  payload: CreateEventPayload
): Promise<CalendarEvent> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No autenticado.");

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({ ...payload, user_id: user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateEvent(
  id: string,
  payload: UpdateEventPayload
): Promise<CalendarEvent> {
  const { data, error } = await supabase
    .from("calendar_events")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}
