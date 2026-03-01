import { useTimer } from '../hooks/useTimerActions';
import { Button } from '@/components/ui/button'
import { SlidingNumber } from '@/components/animate-ui/primitives/texts/sliding-number'
import DialogShare from './Dialog-Share';
import DialogSettings from './DialogSettings';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTimerStore } from '../../../store/timerStore';

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


export const TimerDisplay = ({ link, codigo }: { link: string, codigo: string }) => {
    const { timeLeft, isActive, toggleTimer, handleReset } = useTimer();
    const { settings, setSettings } = useTimerStore();

    // Cambiamos el título de la pestaña del navegador para ver el tiempo ahí también
    //   document.title = `${formatTime(timeLeft)} - Pomodoro App`;

    const handleSaveSettings = (newSettings: TimerSettings) => {
        setSettings(newSettings);
    };

    return (
        <div className="flex flex-col items-center justify-center gap-10 w-full max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
                {/* Controles Izquierda */}
                <div className="flex items-center gap-3 order-2 sm:order-1">
                    <DialogShare link={link} codigo={codigo} />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleReset}
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
                        onClick={toggleTimer}
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