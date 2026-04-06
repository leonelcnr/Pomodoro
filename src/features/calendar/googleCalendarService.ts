import supabase from "@/lib/supabase";

interface GCalEventPayload {
  summary: string;
  description?: string;
  /** ISO date "YYYY-MM-DD" */
  date: string;
}

/** Create a new event in Google Calendar. Returns the Google event ID. */
export async function gcalCreate(
  payload: GCalEventPayload
): Promise<string> {
  const { data, error } = await supabase.functions.invoke("sync-calendar", {
    body: { action: "CREATE", payload },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data.data.id as string;
}

/** Update an existing Google Calendar event by its Google event ID. */
export async function gcalUpdate(
  googleEventId: string,
  payload: GCalEventPayload
): Promise<void> {
  const { data, error } = await supabase.functions.invoke("sync-calendar", {
    body: { action: "UPDATE", payload, googleEventId },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
}

/** Delete a Google Calendar event by its Google event ID. */
export async function gcalDelete(
  googleEventId: string
): Promise<void> {
  const { data, error } = await supabase.functions.invoke("sync-calendar", {
    body: { action: "DELETE", googleEventId },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
}
