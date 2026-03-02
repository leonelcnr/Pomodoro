import { useEffect, useRef } from 'react';
import { useTimerStore } from '../../../store/timerStore';
import supabase from '@/config/supabase';
import { UserAuth } from '@/services/AuthContexto';

export const useTimer = () => {
  const { user } = UserAuth();
  // Traemos las funciones y estados de Zustand
  const { timeLeft, isActive, mode, settings, setTimeLeft, setIsActive, resetTimer, setMode } = useTimerStore();
  
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
          const alarmAudio = new Audio('/src/assets/sounds/alarm.mp3');
          alarmAudio.volume = 0.5;
          alarmAudio.play().catch(e => console.error("Audio play failed:", e));

          clearInterval(interval);
          
          // Guardar sesión de estudio si estábamos en pomodoro
          if (mode === 'pomodoro' && user) {
            const minutesToSave = settings.pomodoro;
            supabase.from('study_sessions').insert([
              { user_id: user.id, duration_minutes: minutesToSave }
            ]).then(({error}) => {
                if(error) console.error("Error saving study session:", error);
            });
          }

          // Lógica de transición al finalizar la sesión actual
          if (mode === 'pomodoro') {
            setMode('shortBreak');
            if (settings.autoBreak) {
              setTimeout(() => setIsActive(true), 0);
            }
          } else {
            // Si estábamos en break, volvemos a pomodoro
            setMode('pomodoro');
            if (settings.autoBreak) {
              setTimeout(() => setIsActive(true), 0);
            }
          }
        } else {
          // Play tick sounds only at 10 and 5 seconds left
          if ([10, 5].includes(secondsLeft) && secondsLeft !== timeLeft) {
            const tickAudio = new Audio('/src/assets/sounds/tick.mp3');
            tickAudio.volume = 0.4;
            tickAudio.play().catch(e => console.error("Audio tick failed:", e));
          }

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
  }, [isActive, setTimeLeft, setIsActive, timeLeft, mode, settings.pomodoro, user]); // Dependencias

  // Funciones para que usen los botones
  const toggleTimer = () => setIsActive(!isActive);
  
  const handleReset = () => {
    setMode('pomodoro');
    endTimeRef.current = null;
  };

  const setPomodoro = () => setMode('pomodoro');
  const setLongBreak = () => setMode('longBreak');
  const setShortBreak = () => setMode('shortBreak');
  return { timeLeft, isActive,mode, toggleTimer, handleReset, setPomodoro, setLongBreak, setShortBreak };
};