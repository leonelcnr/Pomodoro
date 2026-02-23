import { useTimer } from '../hooks/useTimerActions';
import { Button } from '@/components/ui/button'
import { SlidingNumber } from '@/components/animate-ui/primitives/texts/sliding-number'
import { AspectRatio } from '@/components/ui/aspect-ratio';
import DialogShare from './Dialog-Share';
import DialogSettings from './DialogSettings';
import { Play } from 'lucide-react';
import { Pause } from 'lucide-react';
import { RotateCcw } from 'lucide-react';



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
}


export const TimerDisplay = ({ link, codigo }: { link: string, codigo: string }) => {
    const { timeLeft, isActive, mode, toggleTimer, handleReset, setPomodoro, setShortBreak, setLongBreak } = useTimer();

    // Cambiamos el título de la pestaña del navegador para ver el tiempo ahí también
    //   document.title = `${formatTime(timeLeft)} - Pomodoro App`;

    const handleSaveSettings = (newSettings: TimerSettings) => {
        console.log('Settings saved:', newSettings);
        // Aquí puedes guardar los settings en localStorage o en una base de datos
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4">

            <div className='flex justify-between gap-2'>
                <DialogShare link={link} codigo={codigo} />
                <DialogSettings currentSettings={{ pomodoro: 25, shortBreak: 5, longBreak: 15 }} onSaveSettings={handleSaveSettings} />
            </div>
            <div className="w-1/2 overflow-hidden rounded-md ">

                <AspectRatio ratio={16 / 9} className=" rounded-lg border ">
                    <div className="flex flex-col items-center justify-center gap-4 h-full">
                        {/* El Reloj Gigante */}
                        <div className="flex items-baseline gap-2 font-mono text-8xl">
                            <DosDigitos value={Math.floor(timeLeft / 60)} />
                            <span>:</span>
                            <DosDigitos value={timeLeft % 60} />
                        </div>

                        {/* Controles */}
                        <div className="grid grid-cols-2 gap-4 w-2/5 h-10 justify-center items-center">
                            <Button onClick={toggleTimer} className='w-full h-full' variant={isActive ? "outline" : "default"}>
                                {isActive ? <Pause /> : <Play />}
                            </Button>
                            <Button onClick={handleReset} variant="outline" className='w-full h-full'>
                                <RotateCcw />
                            </Button>
                        </div>
                    </div>
                </AspectRatio>
            </div>
        </div >
    );
};