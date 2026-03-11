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
    const { settings, setSettings, lastLocalUpdate } = useTimerStore();
    const { isSupported, pipWindow, requestPiP, closePiP } = useDocumentPiP();

    const handleSaveSettings = (newSettings: TimerSettings) => {
        setSettings(newSettings);
    };

    const togglePiP = async () => {
        if (pipWindow) {
            closePiP();
        } else {
            await requestPiP({ width: 320, height: 240 });
        }
    };

    // Sincronizar hacia Supabase cuando se detecta un cambio de estado local
    React.useEffect(() => {
        // Solo sincronizar si hay roomId y el cambio provino de este cliente
        if (!roomId || !lastLocalUpdate) return;

        const syncToSupabase = async () => {
            const state = useTimerStore.getState();
            const newState = {
                timeLeft: state.timeLeft,
                isActive: state.isActive,
                mode: state.mode,
                updatedAt: new Date().toISOString()
            };

            // Subir a Supabase
            const { error } = await supabase.from("rooms").update({ timer_state: newState }).eq("id", roomId);
            if (error) {
                console.error("Timer update error:", error);
            }
        };

        syncToSupabase();
    }, [lastLocalUpdate, roomId]);


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
                    onToggle={toggleTimer}
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
                        onClick={handleReset}
                        className="h-10 w-10 hover:bg-accent transition-all shadow-sm">
                        <RotateCcw className="w-5 h-5" />
                    </Button>
                </div>

                {/* Contenedor del Reloj y el Indicador de Modo */}
                <div className="relative flex flex-col items-center justify-center order-1 md:order-2">
                    {/* Indicador de Modo Minimalista */}
                    <div className="absolute -top-2 md:-top-3 flex items-center justify-center gap-2 transition-all duration-300">
                        <div className={`w-1.5 h-1.5 rounded-full ${mode === 'pomodoro' ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]' :
                            mode === 'shortBreak' ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' :
                                'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]'
                            }`} />
                        <span className="text-[10px] sm:text-xs font-medium tracking-[0.15em] text-muted-foreground uppercase select-none whitespace-nowrap">
                            {mode === 'pomodoro' ? 'Pomodoro' : mode === 'shortBreak' ? 'Descanso Corto' : 'Descanso Largo'}
                        </span>
                    </div>

                    {/* El Reloj Minimalista */}
                    <div className={`flex items-baseline gap-2 font-mono ${isActive ? 'text-[5rem] md:text-[8rem] lg:text-[9.5rem]' : 'text-[4.5rem] md:text-[7rem] lg:text-[8rem]'} leading-none font-medium tracking-tighter transition-all duration-500 select-none`}>
                        <DosDigitos value={Math.floor(timeLeft / 60)} />
                        <span className={`opacity-20 transition-all duration-500`}>:</span>
                        <DosDigitos value={timeLeft % 60} />
                    </div>
                </div>

                {/* Controles Derecha: Play/Pausa, PiP, Settings */}
                <div className="flex items-center gap-3 order-3">
                    <Button
                        onClick={toggleTimer}
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