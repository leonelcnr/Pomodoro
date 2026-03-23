import { useEffect, useRef } from 'react';
import { useTimerStore } from '@/store/timerStore';
import supabase from '@/lib/supabase';
import { useAuth } from '@/features/auth/context/AuthContext';

// Import assets so Vite handles them correctly
import tickSoundPath from '@/assets/sounds/tick.mp3';
import alarmSoundPath from '@/assets/sounds/alarm.mp3';

// Create global Audio instances so they get loaded and unlocked by user interaction
const alarmAudio = new Audio(alarmSoundPath);
alarmAudio.volume = 0.5;

const tickAudio = new Audio(tickSoundPath);
tickAudio.volume = 0.4;

export const useTimer = () => {
  const { user } = useAuth();
  // Traemos las funciones y estados de Zustand
  const { timeLeft, isActive, mode, settings, setTimeLeft, setIsActive, setMode } = useTimerStore();
  
  // useRef se usa para guardar valores que NO provocan re-renderizados visuales
  // Guardamos la hora exacta en que debería terminar el timer
  const endTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let interval: number | any;

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
          
          // AQUÍ DISPARAMOS UN SONIDO
          alarmAudio.currentTime = 0;
          alarmAudio.play().catch(e => console.error("Audio play failed:", e));

          clearInterval(interval);
          
          // Guardar sesión de estudio si estábamos en pomodoro
          if (mode === 'pomodoro' && user) {
            const minutesToSave = settings.pomodoro;
            
            supabase.rpc('update_user_stats', { extra_minutes: minutesToSave })
              .then(({ error: statsError }) => {
                if (statsError) console.error("Error update_user_stats:", statsError);
              });

            supabase.from('study_sessions').insert([
              { user_id: user.id, duration_minutes: minutesToSave }
            ]).then(({ error: sessionError }) => {
              if (sessionError) console.error("Error inserting study_session:", sessionError);
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
          // Play tick sounds catching possible jumps (throttled interval in background tabs)
          const crossed10 = timeLeft > 10 && secondsLeft <= 10;
          const crossed5 = timeLeft > 5 && secondsLeft <= 5;
          const crossed3 = timeLeft > 3 && secondsLeft <= 3;
          const crossed2 = timeLeft > 2 && secondsLeft <= 2;
          const crossed1 = timeLeft > 1 && secondsLeft <= 1;

          // Checking if we exactly hit or jumped over 10 or 5 seconds
          if (crossed10 || crossed5 || crossed3 || crossed2 || crossed1) {
             // Only play the tick sound for 10 and 5 
             if ((crossed10 && secondsLeft > 5) || crossed5) {
                tickAudio.currentTime = 0;
                tickAudio.play().catch(e => console.error("Audio tick failed:", e));
             }
          }

          // Actualizamos el estado
          if (secondsLeft !== timeLeft) {
             setTimeLeft(secondsLeft);
          }
        }
      }, 200); // Checkeamos cada 200ms para mayor fluidez visual, aunque el cálculo es exacto
    } else {
      // Si pausamos, limpiamos el intervalo y la referencia de tiempo final
      if (interval) clearInterval(interval);
      endTimeRef.current = null;
    }

    // Cleanup: Si el componente se desmonta, limpiamos el intervalo
    return () => clearInterval(interval);
  }, [isActive, setTimeLeft, setIsActive, timeLeft, mode, settings.pomodoro, user, setMode, settings.autoBreak]); // Dependencias

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
