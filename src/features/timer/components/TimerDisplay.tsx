import { useTimer } from '../hooks/useTimerActions';
import { Button } from '@/components/ui/button'
import { SlidingNumber } from '@/components/animate-ui/primitives/texts/sliding-number'
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Settings } from '@/components/animate-ui/icons/settings';
import { Link } from '@/components/animate-ui/icons/link';

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

export const TimerDisplay = () => {
    const { timeLeft, isActive, mode, toggleTimer, handleReset, setPomodoro, setShortBreak, setLongBreak } = useTimer();

    // Cambiamos el título de la pestaña del navegador para ver el tiempo ahí también
    //   document.title = `${formatTime(timeLeft)} - Pomodoro App`;


    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <nav className="shadow-sm flex gap-4 justify-center">
                <Button variant={mode === 'pomodoro' ? 'default' : 'outline'} onClick={setPomodoro}>Pomodoro</Button>
                <Button variant={mode === 'shortBreak' ? 'default' : 'outline'} onClick={setShortBreak}>Short Break</Button>
                <Button variant={mode === 'longBreak' ? 'default' : 'outline'} onClick={setLongBreak}>Long Break</Button>
                <div className='flex justify-between gap-2'>
                    <Settings animateOnHover scale={0} />
                    <Link animateOnHover />
                </div>
            </nav>
            <div className="w-1/2 overflow-hidden rounded-md ">

                <AspectRatio ratio={16 / 9} className="bg-zinc-900 rounded-lg border ">

                    <div className="flex flex-col items-center justify-center gap-4 h-full">
                        {/* El Reloj Gigante */}
                        <div className="flex items-baseline gap-2 font-mono text-8xl">
                            <DosDigitos value={(timeLeft - 30) / 60} />
                            <span>:</span>
                            <DosDigitos value={timeLeft % 60} />
                        </div>

                        {/* Controles */}
                        <div className="flex gap-4 justify-center">
                            <Button onClick={toggleTimer}>
                                {isActive ? 'Pausar' : 'Iniciar'}
                            </Button>
                            <Button onClick={handleReset} variant="outline">
                                Reiniciar
                            </Button>
                        </div>
                    </div>
                </AspectRatio>
            </div>
        </div >
    );
};