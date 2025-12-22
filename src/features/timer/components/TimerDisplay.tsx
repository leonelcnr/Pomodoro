import { Link } from 'react-router-dom';
import { useTimer } from '../hooks/useTimerActions';
import { ArrowLeft} from 'lucide-react'

// Función auxiliar para formatear segundos a MM:SS
const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const TimerDisplay = () => {
    const { timeLeft, isActive, toggleTimer, handleReset, setPomodoro, setShortBreak, setLongBreak } = useTimer();

    // Cambiamos el título de la pestaña del navegador para ver el tiempo ahí también
    //   document.title = `${formatTime(timeLeft)} - Pomodoro App`;

    return (
        <div>
       <nav className="shadow-sm p-4 sticky top-0 z-10 bg">
           <Link to="/" className="text-gray-500 hover:text-blue-600 transition">
             <ArrowLeft />
           </Link>
            <div className="flex gap-4 justify-center mt-6">

                <button
                    className="px-8 py-3 rounded-full font-bold text-xl bg-red-500 hover:bg-red-600 transition-all"
                    onClick={setPomodoro}>Pomodoro</button>
                <button
                    className="px-8 py-3 rounded-full font-bold text-xl bg-gray-600 hover:bg-gray-500 transition-all"
                    onClick={setShortBreak}>Short Break</button>
                <button
                    className="px-8 py-3 rounded-full font-bold text-xl bg-gray-600 hover:bg-gray-500 transition-all"
                    onClick={setLongBreak}>Long Break</button>
            </div>
       </nav>
        <div className="flex flex-col items-center justify-center p-10 bg-gray-800 rounded-2xl shadow-xl text-white">
            {/* El Reloj Gigante */}
            <div className="text-9xl font-bold mb-8 font-mono tracking-widest">
                {formatTime(timeLeft)}
            </div>

            {/* Controles */}
            <div className="flex gap-4 justify-center">
                <button
                    onClick={toggleTimer}
                    className={`px-8 py-3 rounded-full font-bold text-xl transition-all ${isActive
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                >
                    {isActive ? 'Pausar' : 'Iniciar'}
                </button>

                <button
                    onClick={handleReset}
                    className="px-8 py-3 rounded-full font-bold text-xl bg-gray-600 hover:bg-gray-500 transition-all"
                >
                    Reiniciar
                </button>
            </div>
        </div>
        </div>
    );
};