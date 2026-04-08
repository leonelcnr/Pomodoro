import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface Task {
    id: string;
    text: string;
    completed: boolean;
}

interface TaskListProps {
    tasks: Task[];
    type: "personal" | "room";
    newTaskText: string;
    setNewTaskText: (text: string) => void;
    addTask: (type: "personal" | "room") => void;
    toggleTask: (id: string, type: "personal" | "room") => void;
    deleteTask: (id: string, type: "personal" | "room") => void;
}

const TaskItem = ({ 
    task, 
    type,
    onToggle, 
    onDelete 
}: { 
    task: Task; 
    type: "personal" | "room";
    onToggle: (id: string, type: "personal" | "room") => void; 
    onDelete: (id: string, type: "personal" | "room") => void;
}) => {
    const [animatingCompleteness, setAnimatingCompleteness] = useState(false);
    
    // Efectivamente, está "marcada" visualmente si ya estaba completada o está en proceso de animación
    const isCheckedState = task.completed || animatingCompleteness;

    const handleToggle = () => {
        if (!task.completed) {
            setAnimatingCompleteness(true);
            // Espera a que termine la animación de tachado (500ms) antes de completar la tarea
            setTimeout(() => {
                onToggle(task.id, type);
            }, 400); 
        } else {
            onToggle(task.id, type);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="flex items-center justify-between p-3 rounded-xl border bg-card/50 hover:bg-accent/40 transition-all group shadow-sm"
        >
            <div className="flex items-center gap-3 flex-1 overflow-hidden pr-2">
                <Checkbox
                    checked={isCheckedState}
                    onCheckedChange={handleToggle}
                    className="self-start mt-0.5" // Alinear el checkbox con la primera línea de texto
                />
                <div className="flex-1">
                    <span
                        style={{
                            backgroundImage: "linear-gradient(transparent calc(50% - 1px), currentColor calc(50% - 1px), currentColor calc(50% + 1px), transparent calc(50% + 1px))",
                            backgroundSize: isCheckedState ? "100% 100%" : "0% 100%",
                            backgroundRepeat: "no-repeat",
                            transition: "background-size 0.4s cubic-bezier(0.4, 0, 0.2, 1), color 0.4s ease-out, opacity 0.4s ease-out",
                        }}
                        className={`text-sm inline wrap-break-word ${isCheckedState ? "text-muted-foreground opacity-70" : "text-foreground font-medium"}`}
                    >
                        {task.text}
                    </span>
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(task.id, type)}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </motion.div>
    );
};

const TaskList = ({
    tasks,
    type,
    newTaskText,
    setNewTaskText,
    addTask,
    toggleTask,
    deleteTask,
}: TaskListProps) => {
    const [filter, setFilter] = useState<"pending" | "completed">("pending");

    const filteredTasks = tasks.filter(task => 
        filter === "completed" ? task.completed : !task.completed
    );

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input
                    placeholder="Añadir una nueva tarea..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask(type)}
                    className="bg-muted/50 focus-visible:ring-1 focus-visible:ring-offset-0"
                />
                <Button onClick={() => addTask(type)} size="icon" className="shrink-0">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <Button 
                    variant={filter === "pending" ? "default" : "secondary"} 
                    size="sm" 
                    onClick={() => setFilter("pending")}
                    className={`h-7 text-xs rounded-full px-3 transition-colors ${filter === "pending" ? "shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                    Pendientes <span className="ml-1.5 opacity-70 bg-background/20 px-1.5 rounded-md">{tasks.filter(t => !t.completed).length}</span>
                </Button>
                <Button 
                    variant={filter === "completed" ? "default" : "secondary"} 
                    size="sm" 
                    onClick={() => setFilter("completed")}
                    className={`h-7 text-xs rounded-full px-3 transition-colors ${filter === "completed" ? "shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                    Completadas <span className="ml-1.5 opacity-70 bg-background/20 px-1.5 rounded-md">{tasks.filter(t => t.completed).length}</span>
                </Button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar min-h-[100px]">
                <AnimatePresence mode="popLayout">
                    {filteredTasks.length === 0 ? (
                        <motion.p
                            key="empty-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center text-muted-foreground py-10 text-sm italic"
                        >
                            {filter === "pending" ? "¡Todo al día! No hay tareas pendientes." : "Aún no hay tareas completadas."}
                        </motion.p>
                    ) : (
                        filteredTasks.map((task) => (
                            <TaskItem 
                                key={task.id} 
                                task={task} 
                                type={type}
                                onToggle={toggleTask} 
                                onDelete={deleteTask} 
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export const TaskSection = () => {
    const [personalTasks, setPersonalTasks] = useState<Task[]>([]);
    const [roomTasks, setRoomTasks] = useState<Task[]>([]);
    const [newTaskText, setNewTaskText] = useState("");

    const addTask = (type: "personal" | "room") => {
        if (!newTaskText.trim()) return;
        const newTask: Task = {
            id: crypto.randomUUID(),
            text: newTaskText,
            completed: false,
        };
        if (type === "personal") {
            setPersonalTasks(prev => [...prev, newTask]);
        } else {
            setRoomTasks(prev => [...prev, newTask]);
        }
        setNewTaskText("");
    };

    const toggleTask = (id: string, type: "personal" | "room") => {
        const updateTasks = (tasks: Task[]) =>
            tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
        if (type === "personal") {
            setPersonalTasks(prev => updateTasks(prev));
        } else {
            setRoomTasks(prev => updateTasks(prev));
        }
    };

    const deleteTask = (id: string, type: "personal" | "room") => {
        if (type === "personal") {
            setPersonalTasks(prev => prev.filter((t) => t.id !== id));
        } else {
            setRoomTasks(prev => prev.filter((t) => t.id !== id));
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto border-none shadow-none bg-transparent">
            <CardHeader className="px-0">
                <CardTitle className="text-2xl font-bold tracking-tight text-center sm:text-left">Tareas</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-muted/30 p-1 rounded-xl">
                        <TabsTrigger value="personal" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md py-2.5 transition-all">
                            Mis Tareas
                        </TabsTrigger>
                        <TabsTrigger value="room" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md py-2.5 transition-all">
                            Tareas de la Sala
                        </TabsTrigger>
                    </TabsList>
                    <div className="mt-8">
                        <TabsContent value="personal" className="focus-visible:outline-none mt-0">
                            <TaskList
                                tasks={personalTasks}
                                type="personal"
                                newTaskText={newTaskText}
                                setNewTaskText={setNewTaskText}
                                addTask={addTask}
                                toggleTask={toggleTask}
                                deleteTask={deleteTask}
                            />
                        </TabsContent>
                        <TabsContent value="room" className="focus-visible:outline-none mt-0">
                            <TaskList
                                tasks={roomTasks}
                                type="room"
                                newTaskText={newTaskText}
                                setNewTaskText={setNewTaskText}
                                addTask={addTask}
                                toggleTask={toggleTask}
                                deleteTask={deleteTask}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    );
};
