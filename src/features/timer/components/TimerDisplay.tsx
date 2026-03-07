import { useTimer } from '../hooks/useTimerActions';
import { Button } from '@/components/ui/button'
import { SlidingNumber } from '@/components/animate-ui/primitives/texts/sliding-number'
import DialogShare from './Dialog-Share';
import DialogSettings from './DialogSettings';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTimerStore } from '../../../store/timerStore';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import supabase from '@/config/supabase';
import { useDocumentPiP } from '@/hooks/useDocumentPiP';
import { FloatingTimer } from './FloatingTimer';
import { Copy, PictureInPicture2 } from 'lucide-react';
import { MusicPlayer } from '../../room/components/MusicPlayer';

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
    const { isSupported, pipWindow, requestPiP, closePiP } = useDocumentPiP();

    // Referencia para saber si el cambio vino del usuario o de la red
    const isLocalChange = React.useRef(false);

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

    const togglePiP = async () => {
        if (pipWindow) {
            closePiP();
        } else {
            await requestPiP({ width: 320, height: 240 });
        }
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

    // Remove cursor from body when PiP is active, to provide clear feedback
    useEffect(() => {
        if (pipWindow) {
            document.body.classList.add('pip-active-body');
        } else {
            document.body.classList.remove('pip-active-body');
        }
        return () => document.body.classList.remove('pip-active-body');
    }, [pipWindow]);


    return (
        <div className="flex flex-col items-center justify-center gap-10 w-full max-w-4xl mx-auto">
            {pipWindow && createPortal(
                <FloatingTimer
                    timeLeft={timeLeft}
                    isActive={isActive}
                    onToggle={handleToggleTimer}
                    onClose={closePiP}
                />,
                pipWindow.document.body
            )}

            {/* Keep the timer UI mounted but hidden when in PiP mode to prevent unmounting the MusicPlayer iframe */}
            <div className={`${pipWindow ? 'hidden' : 'flex'} flex-col md:flex-row items-center justify-center gap-6 md:gap-12 lg:gap-16 py-8 w-full`}>
                {/* Controles Izquierda: Compartir, Música, Reset */}
                <div className="flex items-center gap-3 order-2 md:order-1">
                    <DialogShare link={link} codigo={codigo} />
                    <MusicPlayer roomId={roomId} />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleResetTimer}
                        className="h-10 w-10 hover:bg-accent transition-all shadow-sm">
                        <RotateCcw className="w-5 h-5" />
                    </Button>
                </div>

                {/* El Reloj Minimalista */}
                <div className={`flex items-baseline gap-2 font-mono ${isActive ? 'text-[5rem] md:text-[8rem] lg:text-[9.5rem]' : 'text-[4.5rem] md:text-[7rem] lg:text-[8rem]'} leading-none font-medium tracking-tighter transition-all duration-500 select-none order-1 md:order-2`}>
                    <DosDigitos value={Math.floor(timeLeft / 60)} />
                    <span className={`opacity-20 transition-all duration-500`}>:</span>
                    <DosDigitos value={timeLeft % 60} />
                </div>

                {/* Controles Derecha: Play/Pausa, PiP, Settings */}
                <div className="flex items-center gap-3 order-3">
                    <Button
                        onClick={handleToggleTimer}
                        size="icon"
                        variant={isActive ? "outline" : "default"}
                        className={`h-10 w-10 shadow-sm transition-all duration-200 ${!isActive && 'bg-primary hover:bg-primary/90'}`}>
                        {isActive ? <Pause className="fill-current w-5 h-5" /> : <Play className="fill-current w-5 h-5 ml-1" />}
                    </Button>
                    {isSupported && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={togglePiP}
                            className="h-10 w-10 text-muted-foreground hover:text-foreground transition-all shadow-sm"
                            title="Abrir en ventana flotante"
                        >
                            <PictureInPicture2 className="w-5 h-5" />
                        </Button>
                    )}
                    <DialogSettings currentSettings={settings} onSaveSettings={handleSaveSettings} />
                </div>
            </div>

            {pipWindow && (
                <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
                    <div className="flex flex-col items-center gap-2">
                        <PictureInPicture2 className="w-12 h-12 text-muted-foreground opacity-50 mb-2" />
                        <h3 className="text-xl font-medium tracking-tight">Temporizador en ventana</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-[250px]">
                            El reloj se está mostrando ahora en una ventana flotante para mantener tu enfoque.
                        </p>
                    </div>
                    <Button variant="outline" onClick={closePiP}>
                        Devolver a esta pestaña
                    </Button>
                </div>
            )}
        </div >
    );
};