import React, { useState, useEffect } from 'react';
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
    const [localValue, setLocalValue] = useState(value.toString());

    // Sync local state when external value changes
    useEffect(() => {
        setLocalValue(value.toString());
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalValue(val);

        // Update parent immediately if valid so saving works smoothly
        if (val !== "") {
            const parsed = parseInt(val, 10);
            if (!isNaN(parsed)) {
                onChange(parsed);
            }
        }
    };

    const handleBlur = () => {
        // Restore to min value or current valid value if input is empty or invalid
        const parsed = parseInt(localValue, 10);
        if (localValue === "" || isNaN(parsed) || parsed < min) {
            setLocalValue(min.toString());
            onChange(min);
        } else {
            setLocalValue(parsed.toString());
            onChange(parsed);
        }
    };

    return (
        <div className="flex items-center border border-input rounded-md overflow-hidden bg-transparent h-9">
            <input
                id={id}
                type="number"
                min={min}
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-16 bg-transparent text-center text-sm outline-none px-2 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-white"
            />
            <div className="flex items-center border-l border-input">
                <Button
                    type="button"
                    variant="ghost"
                    className="h-9 w-9 rounded-none hover:bg-accent hover:text-accent-foreground p-0 text-muted-foreground"
                    onClick={() => {
                        const next = Math.max(min, value - 1);
                        setLocalValue(next.toString());
                        onChange(next);
                    }}
                >
                    <Minus className="h-4 w-4" />
                </Button>
                <div className="w-px h-9 bg-border" />
                <Button
                    type="button"
                    variant="ghost"
                    className="h-9 w-9 rounded-none hover:bg-accent hover:text-accent-foreground p-0 text-muted-foreground"
                    onClick={() => {
                        const next = value + 1;
                        setLocalValue(next.toString());
                        onChange(next);
                    }}
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

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Configuración del Reloj</DialogTitle>
                    <DialogDescription>
                        Ajusta los minutos para cada fase de tu sesión de estudio.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-4">
                    {/* Input Pomodoro */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="pomodoro" className="text-base font-medium">
                                Pomodoro
                            </Label>
                            <span className="text-sm text-muted-foreground">Duración de la sesión de enfoque.</span>
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
                            <Label htmlFor="shortBreak" className="text-base font-medium">
                                Descanso Corto
                            </Label>
                            <span className="text-sm text-muted-foreground">Pausa breve entre pomodoros.</span>
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
                            <Label htmlFor="longBreak" className="text-base font-medium">
                                Descanso Largo
                            </Label>
                            <span className="text-sm text-muted-foreground">Pausa más extensa tras varios ciclos.</span>
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
                            <Label htmlFor="autoBreak" className="text-base font-medium">
                                Descanso Automático
                            </Label>
                            <span className="text-sm text-muted-foreground">Inicia el descanso al terminar un pomodoro.</span>
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
                        >
                            Guardar Cambios
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default React.memo(DialogSettings);