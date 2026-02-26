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

const TaskList = ({
    tasks,
    type,
    newTaskText,
    setNewTaskText,
    addTask,
    toggleTask,
    deleteTask,
}: TaskListProps) => (
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
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar min-h-[100px]">
            <AnimatePresence initial={false}>
                {tasks.length === 0 ? (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-muted-foreground py-10 text-sm italic"
                    >
                        No hay tareas aún. ¡Empieza añadiendo una!
                    </motion.p>
                ) : (
                    tasks.map((task) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex items-center justify-between p-3 rounded-xl border bg-card/50 hover:bg-accent/40 transition-all group shadow-sm"
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <Checkbox
                                    checked={task.completed}
                                    onCheckedChange={() => toggleTask(task.id, type)}
                                />
                                <span
                                    className={`text-sm transition-all wrap-break-word ${task.completed ? "line-through text-muted-foreground opacity-70" : "text-foreground font-medium"
                                        }`}
                                >
                                    {task.text}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteTask(task.id, type)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </motion.div>
                    ))
                )}
            </AnimatePresence>
        </div>
    </div>
);

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
                        <TabsTrigger value="personal" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md py-2.5">
                            Mis Tareas
                        </TabsTrigger>
                        <TabsTrigger value="room" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md py-2.5">
                            Tareas de la Sala
                        </TabsTrigger>
                    </TabsList>
                    <div className="mt-8">
                        <TabsContent value="personal" className="focus-visible:outline-none">
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
                        <TabsContent value="room" className="focus-visible:outline-none">
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
