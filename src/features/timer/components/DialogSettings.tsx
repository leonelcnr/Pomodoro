import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

// Definimos la estructura de la configuración
export interface TimerSettings {
    pomodoro: number;
    shortBreak: number;
    longBreak: number;
}

interface DialogSettingsProps {
    currentSettings: TimerSettings;
    onSaveSettings: (newSettings: TimerSettings) => void;
}

const DialogSettings: React.FC<DialogSettingsProps> = ({
    currentSettings,
    onSaveSettings
}) => {
    // Estado local para manejar los inputs antes de guardar
    const [settings, setSettings] = useState<TimerSettings>(currentSettings);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings((prev) => ({
            ...prev,
            [name]: parseInt(value) || 0, // Convertimos a número, si está vacío ponemos 0
        }));
    };

    const handleSave = () => {
        onSaveSettings(settings);
        // Nota: El DialogClose de Shadcn cerrará el modal automáticamente si envolvemos el botón
    };

    return (
        <Dialog>
            {/* EL BOTÓN QUE ABRE EL MODAL */}
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <Settings className="h-5 w-5" />
                </Button>
            </DialogTrigger>

            {/* EL CONTENIDO DEL MODAL */}
            <DialogContent className="sm:max-w-[425px] bg-[#18181b] border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>Configuración del Reloj</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Ajusta los minutos para cada fase de tu sesión de estudio.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Input Pomodoro */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="pomodoro" className="text-right text-zinc-300">
                            Pomodoro
                        </Label>
                        <Input
                            id="pomodoro"
                            name="pomodoro"
                            type="number"
                            min="1"
                            value={settings.pomodoro}
                            onChange={handleChange}
                            className="col-span-3 bg-[#09090b] border-zinc-700 text-white focus-visible:ring-[#8b5cf6]"
                        />
                    </div>

                    {/* Input Descanso Corto */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="shortBreak" className="text-right text-zinc-300">
                            Descanso Corto
                        </Label>
                        <Input
                            id="shortBreak"
                            name="shortBreak"
                            type="number"
                            min="1"
                            value={settings.shortBreak}
                            onChange={handleChange}
                            className="col-span-3 bg-[#09090b] border-zinc-700 text-white focus-visible:ring-[#8b5cf6]"
                        />
                    </div>

                    {/* Input Descanso Largo */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="longBreak" className="text-right text-zinc-300">
                            Descanso Largo
                        </Label>
                        <Input
                            id="longBreak"
                            name="longBreak"
                            type="number"
                            min="1"
                            value={settings.longBreak}
                            onChange={handleChange}
                            className="col-span-3 bg-[#09090b] border-zinc-700 text-white focus-visible:ring-[#8b5cf6]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    {/* DialogClose permite cerrar el modal al hacer clic */}
                    <DialogClose asChild>
                        <Button
                            type="submit"
                            onClick={handleSave}
                            className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
                        >
                            Guardar Cambios
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DialogSettings;