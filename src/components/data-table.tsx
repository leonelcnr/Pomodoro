import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconPlus,
  IconTrendingUp,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { z } from "zod"
import { Trash2, Edit2, Star, X, ArrowUp, ArrowRight, ArrowDown, CheckCircle2, Timer, CircleDashed } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FieldGroup, Field, FieldLabel, FieldContent } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


// Esquema de validación para cada tarea usando Zod
export const schema = z.object({
  id: z.number(),        // ID único de la tarea
  header: z.string(),    // Título/nombre de la tarea
  type: z.string(),      // Tipo de tarea
  status: z.string(),    // Estado: Completada, En Progreso, Sin Empezar
  limit: z.string(),     // Límite o fecha límite
  favorite: z.boolean().optional(), // Tarea favorita o destacada
  priority: z.string().optional(),
})

/**
 * Componente DragHandle - Manilla de arrastre para reordenar filas
 * Permite al usuario arrastrar y soltar tareas para reordenarlas
 * @param id - ID de la tarea que se puede arrastrar
 */
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Arrastrar para reordenar</span>
    </Button>
  )
}

/**
 * Definición de columnas de la tabla
 * Cada columna define cómo se muestra y comporta una parte de los datos de la tarea
 */
const getColumns = (
  onDeleteTask: (id: number) => void,
  onToggleFavorite: (id: number) => void,
  onEditTask: (task: z.infer<typeof schema>) => void
): ColumnDef<z.infer<typeof schema>>[] => [
    // Columna de arrastre - permite reordenar tareas
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    // Columna de selección - permite seleccionar múltiples tareas
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Seleccionar todo"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Seleccionar fila"
          />
        </div>
      ),
      enableHiding: false,
    },
    // Columna de título de la tarea (Badge + Título)
    {
      accessorKey: "header",
      header: "Título",
      cell: ({ row }) => {
        return (
          <div className="flex items-center space-x-2">
            {row.original.favorite && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
            <Badge variant="outline" className="text-muted-foreground px-1.5 whitespace-nowrap">
              {row.original.type}
            </Badge>
            <span className="max-w-[500px] truncate font-medium">
              <TableCellViewer item={row.original} />
            </span>
          </div>
        )
      },
      enableHiding: false,
    },
    // Columna de estado - muestra si está completada, en progreso o sin empezar
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-muted-foreground px-1.5 flex items-center gap-1.5">
          {row.original.status === "Completada" ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
          ) : row.original.status === "En Progreso" ? (
            <Timer className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
          ) : (
            <CircleDashed className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span>{row.original.status}</span>
        </Badge>
      ),
      filterFn: (row, id, value) => {
        if (!value || value.length === 0) return true
        return value.includes(row.getValue(id))
      },
    },
    // Columna de Prioridad
    {
      accessorKey: "priority",
      header: "Prioridad",
      cell: ({ row }) => {
        const priorityStr = row.original.priority || "Medium"
        const isHigh = priorityStr === "High" || priorityStr === "Alta"
        const isMedium = priorityStr === "Medium" || priorityStr === "Media"
        const label = isHigh ? "Alta" : isMedium ? "Media" : "Baja"
        return (
          <div className="flex w-[100px] items-center">
            <span className="text-muted-foreground mr-2">
              {isHigh ? <ArrowUp className="h-4 w-4" /> : isMedium ? <ArrowRight className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            </span>
            <span>{label}</span>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        if (!value || value.length === 0) return true
        return value.includes(row.getValue(id))
      },
    },

    // Columna de acciones - menú para editar, copiar o eliminar tareas
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex h-8 w-8 p-0"
              size="icon"
            >
              <IconDotsVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem onClick={() => onEditTask(row.original)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleFavorite(row.original.id)}>
              <Star className={`mr-2 h-4 w-4 ${row.original.favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              {row.original.favorite ? 'Quitar Favorito' : 'Favorito'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => onDeleteTask(row.original.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

/**
 * Componente DraggableRow - Fila de tabla arrastrable
 * Permite al usuario arrastrar y soltar filas para reordenar las tareas
 * @param row - Los datos de la fila de la tabla
 */
function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  // Hook de useSortable para manejar el arrastre
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

/**
 * Componente principal DataTable - Tabla de gestión de tareas
 * Muestra una tabla interactiva con funcionalidades de ordenamiento, filtrado, paginación y arrastre
 * @param data - Array de tareas a mostrar en la tabla
 */
export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[]
}) {
  // Estados para manejar los datos y el comportamiento de la tabla
  const [data, setData] = React.useState(() => initialData) // Datos de las tareas
  const [rowSelection, setRowSelection] = React.useState({}) // Filas seleccionadas
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({}) // Visibilidad de columnas
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  ) // Filtros aplicados
  const [sorting, setSorting] = React.useState<SortingState>([]) // Ordenamiento de columnas
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  }) // Configuración de paginación

  // Add Task dialog state
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [newTask, setNewTask] = React.useState<Partial<z.infer<typeof schema>>>({
    header: "",
    status: "Sin Empezar",
    priority: "Medium",
    type: "",
  })

  const sortableId = React.useId()

  const handleDeleteTask = (id: number) => {
    setData((prev) => prev.filter((task) => task.id !== id))
  }

  const handleToggleFavorite = (id: number) => {
    setData((prev) => prev.map((task) =>
      task.id === id ? { ...task, favorite: !task.favorite } : task
    ))
  }

  const handleEditTask = (task: z.infer<typeof schema>) => {
    setNewTask(task)
    setIsDialogOpen(true)
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()

    if (newTask.id) {
      // Edit existing
      setData((prev) => prev.map(t => t.id === newTask.id ? { ...t, ...newTask } as z.infer<typeof schema> : t))
    } else {
      // Add new
      const newId = data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;
      const newTaskEntry: z.infer<typeof schema> = {
        id: newId,
        header: newTask.header || "Nueva Tarea",
        type: newTask.type || "General",
        status: newTask.status || "Sin Empezar",
        limit: "N/A",
        favorite: newTask.favorite || false,
        priority: newTask.priority || "Medium",
      }
      setData((prev) => [...prev, newTaskEntry])
    }

    setIsDialogOpen(false) // Close dialog
    // Reset form
    setNewTask({
      header: "",
      status: "Sin Empezar",
      priority: "Medium",
      type: "",
    })
  }

  // Derive columns here to pass the delete function
  const columns = React.useMemo(() => getColumns(handleDeleteTask, handleToggleFavorite, handleEditTask), [])

  // Sensores para detectar eventos de mouse, touch y teclado para el arrastre
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  // Memorización de los IDs de las tareas para optimizar el rendimiento
  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  // Configuración de la tabla usando React Table
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true, // Permite seleccionar filas
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const handleDeleteSelected = () => {
    const selectedIds = table.getFilteredSelectedRowModel().rows.map(r => r.original.id)
    setData((prev) => prev.filter((task) => !selectedIds.includes(task.id)))
    table.resetRowSelection()
  }

  /**
   * Función handleDragEnd - Maneja el evento cuando se termina de arrastrar una fila
   * Reordena las tareas en el array de datos
   */
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex) // Mueve la tarea de una posición a otra
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            placeholder="Filtrar tareas..."
            value={(table.getColumn("header")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("header")?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-dashed">
                <IconPlus className="mr-2 h-4 w-4" />
                Estado
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[150px]">
              {["Completada", "En Progreso", "Sin Empezar"].map((status) => {
                const isSelected = (table.getColumn("status")?.getFilterValue() as string[])?.includes(status)
                return (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      const current = (table.getColumn("status")?.getFilterValue() as string[]) || []
                      const next = checked ? [...current, status] : current.filter((v) => v !== status)
                      table.getColumn("status")?.setFilterValue(next.length ? next : undefined)
                    }}
                  >
                    <div className="flex items-center">
                      {status === "Completada" && <CheckCircle2 className="mr-2 h-4 w-4 text-green-500 dark:text-green-400" />}
                      {status === "En Progreso" && <Timer className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />}
                      {status === "Sin Empezar" && <CircleDashed className="mr-2 h-4 w-4 text-muted-foreground" />}
                      <span>{status}</span>
                    </div>
                  </DropdownMenuCheckboxItem>
                )
              })}
              {((table.getColumn("status")?.getFilterValue() as string[])?.length ?? 0) > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => table.getColumn("status")?.setFilterValue(undefined)} className="justify-center text-center">
                    Limpiar filtros
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-dashed">
                <IconPlus className="mr-2 h-4 w-4" />
                Prioridad
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[150px]">
              {[
                { value: "High", label: "Alta" },
                { value: "Medium", label: "Media" },
                { value: "Low", label: "Baja" }
              ].map((priority) => {
                const isSelected = (table.getColumn("priority")?.getFilterValue() as string[])?.includes(priority.value)
                return (
                  <DropdownMenuCheckboxItem
                    key={priority.value}
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      const current = (table.getColumn("priority")?.getFilterValue() as string[]) || []
                      const next = checked ? [...current, priority.value] : current.filter((v) => v !== priority.value)
                      table.getColumn("priority")?.setFilterValue(next.length ? next : undefined)
                    }}
                  >
                    {priority.label}
                  </DropdownMenuCheckboxItem>
                )
              })}
              {((table.getColumn("priority")?.getFilterValue() as string[])?.length ?? 0) > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => table.getColumn("priority")?.setFilterValue(undefined)} className="justify-center text-center">
                    Limpiar filtros
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {(table.getColumn("header")?.getFilterValue() as string) && (
            <Button
              variant="ghost"
              onClick={() => table.getColumn("header")?.setFilterValue("")}
              className="h-8 px-2 lg:px-3"
            >
              Limpiar
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              className="h-8"
              onClick={handleDeleteSelected}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Borrar Seleccionados
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto hidden h-8 lg:flex"
              >
                <IconLayoutColumns className="mr-2 h-4 w-4" />
                Ver
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 bg-purple-500 hover:bg-purple-600 text-white dark:bg-purple-600 dark:hover:bg-purple-700">
                Agregar Tarea
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nueva Tarea</DialogTitle>
                <DialogDescription>
                  Completa los campos para agregar una nueva tarea a la tabla. Haz clic en guardar cuando termines.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddTask}>
                <FieldGroup className="gap-5 py-4">
                  <Field>
                    <FieldLabel>Nombre de la Tarea</FieldLabel>
                    <FieldContent>
                      <Input
                        id="name"
                        placeholder="Ej. Actualizar diseño..."
                        value={newTask.header}
                        onChange={(e) => setNewTask(prev => ({ ...prev, header: e.target.value }))}
                        required
                      />
                    </FieldContent>
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Estado</FieldLabel>
                      <FieldContent>
                        <Select
                          value={newTask.status}
                          onValueChange={(val) => setNewTask(prev => ({ ...prev, status: val }))}
                        >
                          <SelectTrigger id="status-new-task">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Completada">Completada</SelectItem>
                            <SelectItem value="En Progreso">En Progreso</SelectItem>
                            <SelectItem value="Sin Empezar">Sin Empezar</SelectItem>
                          </SelectContent>
                        </Select>
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>Prioridad</FieldLabel>
                      <FieldContent>
                        <Select
                          value={newTask.priority}
                          onValueChange={(val) => setNewTask(prev => ({ ...prev, priority: val }))}
                        >
                          <SelectTrigger id="priority-new-task">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High">Alta</SelectItem>
                            <SelectItem value="Medium">Media</SelectItem>
                            <SelectItem value="Low">Baja</SelectItem>
                          </SelectContent>
                        </Select>
                      </FieldContent>
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel>Tipo</FieldLabel>
                    <FieldContent>
                      <Input
                        id="type-new-task"
                        placeholder="Ej. Diseño..."
                        value={newTask.type}
                        onChange={(e) => setNewTask((prev) => ({ ...prev, type: e.target.value }))}
                        required
                      />
                    </FieldContent>
                  </Field>
                </FieldGroup>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit">Guardar Cambios</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          id={sortableId}
        >
          <Table>
            <TableHeader className="sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {table.getRowModel().rows?.length ? (
                <SortableContext
                  items={dataIds}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow key={row.id} row={row} />
                  ))}
                </SortableContext>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No hay resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
        </div>
        <div className="flex w-full flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Filas por página
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir a la primera página</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir a la página anterior</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir a la página siguiente</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir a la última página</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div >
  )
}

// Datos de ejemplo para el gráfico
const chartData = [
  { month: "Enero", desktop: 186, mobile: 80 },
  { month: "Febrero", desktop: 305, mobile: 200 },
  { month: "Marzo", desktop: 237, mobile: 120 },
  { month: "Abril", desktop: 73, mobile: 190 },
  { month: "Mayo", desktop: 209, mobile: 130 },
  { month: "Junio", desktop: 214, mobile: 140 },
]

// Configuración de colores para el gráfico
const chartConfig = {
  desktop: {
    label: "Escritorio",
    color: "var(--primary)",
  },
  mobile: {
    label: "Móvil",
    color: "var(--primary)",
  },
} satisfies ChartConfig

/**
 * Componente TableCellViewer - Visor detallado de una tarea
 * Muestra un drawer (cajón lateral) con información detallada de la tarea
 * @param item - Datos de la tarea a mostrar
 */
function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile()

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.header}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.header}</DrawerTitle>
          <DrawerDescription>
            Mostrando el total de visitantes de los últimos 6 meses
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 0,
                    right: 10,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    fillOpacity={0.6}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium">
                  Tendencia al alza del 5.2% este mes{" "}
                  <IconTrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground">
                  Mostrando el total de visitantes de los últimos 6 meses. Este es solo
                  un texto de ejemplo para probar el diseño. Abarca múltiples líneas
                  y debería ajustarse automáticamente.
                </div>
              </div>
              <Separator />
            </>
          )}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="header">Título de la Tarea</Label>
              <Input id="header" defaultValue={item.header} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="type">Tipo</Label>
                <Select defaultValue={item.type}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tabla de Contenidos">
                      Tabla de Contenidos
                    </SelectItem>
                    <SelectItem value="Resumen Ejecutivo">
                      Resumen Ejecutivo
                    </SelectItem>
                    <SelectItem value="Enfoque Técnico">
                      Enfoque Técnico
                    </SelectItem>
                    <SelectItem value="Diseño">Diseño</SelectItem>
                    <SelectItem value="Capacidades">Capacidades</SelectItem>
                    <SelectItem value="Documentos de Enfoque">
                      Documentos de Enfoque
                    </SelectItem>
                    <SelectItem value="Narrativa">Narrativa</SelectItem>
                    <SelectItem value="Portada">Portada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Estado</Label>
                <Select defaultValue={item.status}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completada">Completada</SelectItem>
                    <SelectItem value="En Progreso">En Progreso</SelectItem>
                    <SelectItem value="Sin Empezar">Sin Empezar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="limit">Límite</Label>
                <Input id="limit" defaultValue={item.limit} />
              </div>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button>Enviar</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cerrar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
