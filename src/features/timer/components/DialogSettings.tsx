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
import { Label } from "@/components/ui/label";
import { Settings, Minus, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Definimos la estructura de la configuración
export interface TimerSettings {
    pomodoro: number;
    shortBreak: number;
    longBreak: number;
    autoBreak: boolean;
}

interface DialogSettingsProps {
    currentSettings: TimerSettings;
    onSaveSettings: (newSettings: TimerSettings) => void;
}

interface NumberInputProps {
    id: string;
    value: number;
    onChange: (val: number) => void;
    min?: number;
}

const NumberInput: React.FC<NumberInputProps> = ({ id, value, onChange, min = 1 }) => {
    return (
        <div className="flex items-center border border-zinc-700 rounded-md overflow-hidden bg-transparent h-9">
            <input
                id={id}
                type="number"
                min={min}
                value={value}
                onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) onChange(val);
                }}
                className="w-16 bg-transparent text-center text-sm outline-none px-2 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-white"
            />
            <div className="flex items-center border-l border-zinc-700">
                <Button
                    type="button"
                    variant="ghost"
                    className="h-9 w-9 rounded-none hover:bg-zinc-800 p-0 text-zinc-400"
                    onClick={() => onChange(Math.max(min, value - 1))}
                >
                    <Minus className="h-4 w-4" />
                </Button>
                <div className="w-[1px] h-9 bg-zinc-700" />
                <Button
                    type="button"
                    variant="ghost"
                    className="h-9 w-9 rounded-none hover:bg-zinc-800 p-0 text-zinc-400"
                    onClick={() => onChange(value + 1)}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

const DialogSettings: React.FC<DialogSettingsProps> = ({
    currentSettings,
    onSaveSettings
}) => {
    // Estado local para manejar los inputs antes de guardar
    const [settings, setSettings] = useState<TimerSettings>(currentSettings);

    const handleUpdate = <K extends keyof TimerSettings>(name: K, value: TimerSettings[K]) => {
        setSettings((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = () => {
        onSaveSettings(settings);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10">
                    <Settings />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px] bg-[#18181b] border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>Configuración del Reloj</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Ajusta los minutos para cada fase de tu sesión de estudio.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-4">
                    {/* Input Pomodoro */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="pomodoro" className="text-zinc-200 text-base font-medium">
                                Pomodoro
                            </Label>
                            <span className="text-sm text-zinc-500">Duración de la sesión de enfoque.</span>
                        </div>
                        <NumberInput
                            id="pomodoro"
                            value={settings.pomodoro}
                            onChange={(val) => handleUpdate("pomodoro", val)}
                        />
                    </div>

                    {/* Input Descanso Corto */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="shortBreak" className="text-zinc-200 text-base font-medium">
                                Descanso Corto
                            </Label>
                            <span className="text-sm text-zinc-500">Pausa breve entre pomodoros.</span>
                        </div>
                        <NumberInput
                            id="shortBreak"
                            value={settings.shortBreak}
                            onChange={(val) => handleUpdate("shortBreak", val)}
                        />
                    </div>

                    {/* Input Descanso Largo */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="longBreak" className="text-zinc-200 text-base font-medium">
                                Descanso Largo
                            </Label>
                            <span className="text-sm text-zinc-500">Pausa más extensa tras varios ciclos.</span>
                        </div>
                        <NumberInput
                            id="longBreak"
                            value={settings.longBreak}
                            onChange={(val) => handleUpdate("longBreak", val)}
                        />
                    </div>

                    {/* Switch Descanso Automático */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="autoBreak" className="text-zinc-200 text-base font-medium">
                                Descanso Automático
                            </Label>
                            <span className="text-sm text-zinc-500">Inicia el descanso al terminar un pomodoro.</span>
                        </div>
                        <Switch
                            id="autoBreak"
                            checked={settings.autoBreak}
                            onCheckedChange={(val) => handleUpdate("autoBreak", val)}
                        />
                    </div>
                </div>

                <DialogFooter>
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