import { create } from 'zustand';

// Definimos los tipos de datos
interface TimerState {
  timeLeft: number;      // Tiempo restante en segundos
  initialTime: number;   // Para poder resetear (ej: 25 * 60)
  isActive: boolean;     // ¿Está corriendo el reloj?
  mode: 'pomodoro' | 'shortBreak' | 'longBreak'; // El modo actual
  
  // Acciones (funciones que modifican el estado)
  setTimeLeft: (time: number) => void;
  setIsActive: (active: boolean) => void;
  setMode: (mode: 'pomodoro' | 'shortBreak' | 'longBreak') => void;
  resetTimer: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  timeLeft: 25 * 60, // 25 minutos por defecto
  initialTime: 25 * 60,
  isActive: false,
  mode: 'pomodoro',

  setTimeLeft: (time) => set({ timeLeft: time }),
  setIsActive: (active) => set({ isActive: active }),
  setMode: (mode) => {
    // Cuando cambiamos de modo, reseteamos el tiempo según el modo
    const times = {
      pomodoro: 25 * 60,
      shortBreak: 5 * 60,
      longBreak: 15 * 60,
    };
    set({ mode, timeLeft: times[mode], initialTime: times[mode], isActive: false });
  },
  resetTimer: () => set({ timeLeft: get().initialTime, isActive: false }),
}));