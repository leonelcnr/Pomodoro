import { useTimer } from '../hooks/useTimerActions';
import { Button } from '@/components/ui/button'
import { SlidingNumber } from '@/components/animate-ui/primitives/texts/sliding-number'
import DialogShare from './Dialog-Share';
import DialogSettings from './DialogSettings';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTimerStore } from '../../../store/timerStore';
import React from 'react';
import supabase from '@/config/supabase';

function DosDigitos({ value }: { value: number }) {
    const tens = Math.floor(value / 10);
    const ones = value % 10;

    return (
        <span className="inline-flex">
            <SlidingNumber number={tens} initiallyStable />
            <SlidingNumber number={ones} initiallyStable />
        </span>
    );
}
export interface TimerSettings {
    pomodoro: number;
    shortBreak: number;
    longBreak: number;
    autoBreak: boolean;
}


export const TimerDisplay = ({ link, codigo, roomId }: { link: string, codigo: string, roomId?: string }) => {
    const { timeLeft, isActive, mode, toggleTimer, handleReset } = useTimer();
    const { settings, setSettings } = useTimerStore();

    // Referencia para saber si el cambio vino del usuario o de la red
    const isLocalChange = React.useRef(false);

    // Cambiamos el título de la pestaña del navegador para ver el tiempo ahí también
    //   document.title = `${formatTime(timeLeft)} - Pomodoro App`;

    const handleSaveSettings = (newSettings: TimerSettings) => {
        setSettings(newSettings);
        isLocalChange.current = true;
    };

    const handleToggleTimer = () => {
        isLocalChange.current = true;
        toggleTimer();
    };

    const handleResetTimer = () => {
        isLocalChange.current = true;
        handleReset();
    };

    // Sincronizar hacia Supabase cuando este usuario hace un cambio
    React.useEffect(() => {
        if (!roomId || !isLocalChange.current) return;

        const syncToSupabase = async () => {
            const newState = {
                timeLeft,
                isActive,
                mode,
                updatedAt: new Date().toISOString()
            };

            // Subir a Supabase
            const { error } = await supabase.from("rooms").update({ timer_state: newState }).eq("id", roomId);
            if (error) {
                alert(`Error guardando el reloj en Supabase: ${error.message}`);
                console.error("Timer update error:", error);
            }
            isLocalChange.current = false;
        };

        // Evitamos spamear la base de datos cada segundo; solo mandamos cuando se pausa, resetea o arranca.
        // Opcionalmente se podría mandar cada 10 segundos, pero el "updatedAt" ya nos ayuda matemáticamente.
        syncToSupabase();
    }, [isActive, mode, roomId]); // No incluimos timeLeft aquí intencionalmente para evitar 1 update por segundo

    return (
        <div className="flex flex-col items-center justify-center gap-10 w-full max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
                {/* Controles Izquierda */}
                <div className="flex items-center gap-3 order-2 sm:order-1">
                    <DialogShare link={link} codigo={codigo} />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleResetTimer}
                        className="h-10 w-10 hover:bg-accent transition-all">
                        <RotateCcw className="w-5 h-5" />
                    </Button>
                </div>

                {/* El Reloj Minimalista */}
                <div className={`flex items-baseline gap-2 font-mono ${isActive ? 'text-[4.5rem] sm:text-[8rem]' : 'text-[4rem] sm:text-[6rem]'} leading-none font-medium tracking-tighter transition-all duration-500 select-none order-1 sm:order-2`}>
                    <DosDigitos value={Math.floor(timeLeft / 60)} />
                    <span className={`opacity-30 ${isActive ? 'text-[4.5rem] sm:text-[8rem]' : 'text-[4rem] sm:text-[6rem]'} transition-all duration-500`}>:</span>
                    <DosDigitos value={timeLeft % 60} />
                </div>

                {/* Controles Derecha */}
                <div className="flex items-center gap-3 order-3">
                    <Button
                        onClick={handleToggleTimer}
                        size="icon"
                        variant={isActive ? "outline" : "default"}
                        className="h-10 w-10 shadow-sm bg-primary hover:bg-primary/90">
                        {isActive ? <Pause className="fill-current w-5 h-5" /> : <Play className="fill-current w-5 h-5 ml-0.5" />}
                    </Button>
                    <DialogSettings currentSettings={settings} onSaveSettings={handleSaveSettings} />
                </div>
            </div>
        </div >
    );
};