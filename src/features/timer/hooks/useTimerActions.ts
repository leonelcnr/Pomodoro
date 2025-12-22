import { useEffect, useRef } from 'react';
import { useTimerStore } from '../../../store/timerStore';

export const useTimer = () => {
  // Traemos las funciones y estados de Zustand
  const { timeLeft, isActive, setTimeLeft, setIsActive, resetTimer, setMode } = useTimerStore();
  
  // useRef se usa para guardar valores que NO provocan re-renderizados visuales
  // Guardamos la hora exacta en que debería terminar el timer
  const endTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeLeft > 0) {
      // 1. Si acabamos de arrancar (o reanudar), calculamos cuándo debe terminar.
      // La fórmula es: Ahora + Segundos que faltan * 1000 (ms)
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }

      // 2. Iniciamos el intervalo
      interval = setInterval(() => {
        const now = Date.now();
        // Calculamos cuánto falta restando la meta (endTime) menos el ahora
        const difference = endTimeRef.current! - now;
        
        // Convertimos milisegundos a segundos
        const secondsLeft = Math.ceil(difference / 1000);

        if (secondsLeft <= 0) {
          // TERMINÓ EL TIMER
          setTimeLeft(0);
          setIsActive(false);
          endTimeRef.current = null; // Limpiamos la referencia
          // AQUÍ PODRÍAMOS DISPARAR UN SONIDO O UNA NOTIFICACIÓN
          clearInterval(interval);
        } else {
          // Actualizamos el estado
          setTimeLeft(secondsLeft);
        }
      }, 200); // Checkeamos cada 200ms para mayor fluidez visual, aunque el cálculo es exacto
    } else {
      // Si pausamos, limpiamos el intervalo y la referencia de tiempo final
      if (interval) clearInterval(interval);
      endTimeRef.current = null;
    }

    // Cleanup: Si el componente se desmonta, limpiamos el intervalo
    return () => clearInterval(interval);
  }, [isActive, setTimeLeft, setIsActive, timeLeft]); // Dependencias

  // Funciones para que usen los botones
  const toggleTimer = () => setIsActive(!isActive);
  
  const handleReset = () => {
    resetTimer();
    endTimeRef.current = null;
  };

  const setPomodoro = () => setMode('pomodoro');
  const setLongBreak = () => setMode('longBreak');
  const setShortBreak = () => setMode('shortBreak');
  return { timeLeft, isActive, toggleTimer, handleReset, setPomodoro, setLongBreak, setShortBreak };
};