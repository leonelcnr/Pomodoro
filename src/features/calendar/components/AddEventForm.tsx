import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Trash2 } from "lucide-react"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMemo } from "react"
import type { CalendarEvent, EventType } from "../calendarService"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "El título debe tener al menos 2 caracteres.",
  }),
  date: z.date(),
  type: z.enum(["Examen", "Entrega", "Estudio", "Otro"]),
  description: z.string().optional(),
})

interface AddEventFormProps {
  onSuccess?: () => void;
  /** When provided, form enters edit mode */
  event?: CalendarEvent;
  initialDate?: Date;
  onSubmitEvent: (
    values: { title: string; date: Date; type: EventType; description?: string },
    id?: string
  ) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function AddEventForm({
  onSuccess,
  event,
  initialDate,
  onSubmitEvent,
  onDelete,
}: AddEventFormProps) {
  const isEdit = !!event;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: event?.title ?? "",
      type: (event?.type as EventType) ?? "Examen",
      date: event ? new Date(event.event_date + "T00:00:00") : initialDate,
      description: event?.description ?? "",
    },
  })

  const startOfToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Close the dialog immediately — background work reports via toast
    form.reset();
    onSuccess?.();
    // Fire-and-forget: hook handles optimistic update + error rollback
    onSubmitEvent(values, event?.id);
  }

  async function handleDelete() {
    if (event && onDelete) {
      // Close dialog immediately — hook handles optimistic removal + rollback
      onSuccess?.();
      onDelete(event.id);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título del Evento</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Examen final de algoritmos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Examen">Examen</SelectItem>
                  <SelectItem value="Entrega">Entrega</SelectItem>
                  <SelectItem value="Estudio">Sesión de Estudio</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: es })
                      ) : (
                        <span>Elige una fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < startOfToday}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                El evento aparecerá en tu calendario.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <FormControl>
                <Input placeholder="Notas adicionales..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className={cn("flex gap-2", isEdit ? "flex-row justify-between" : "flex-col")}>
          {isEdit && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          )}
          <Button type="submit" className={cn(!isEdit && "w-full")}>
            {isEdit ? "Guardar Cambios" : "Guardar Evento"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
