import { create } from 'zustand';

// Definimos los tipos de datos
interface TimerState {
  timeLeft: number;      // Tiempo restante en segundos
  initialTime: number;   // Para poder resetear (ej: 25 * 60)
  isActive: boolean;     // ¿Está corriendo el reloj?
  mode: 'pomodoro' | 'shortBreak' | 'longBreak'; // El modo actual
  settings: {
    pomodoro: number;
    shortBreak: number;
    longBreak: number;
    autoBreak: boolean;
  };

  // Acciones (funciones que modifican el estado)
  setTimeLeft: (time: number) => void;
  setIsActive: (active: boolean) => void;
  setMode: (mode: 'pomodoro' | 'shortBreak' | 'longBreak') => void;
  setSettings: (settings: { pomodoro: number; shortBreak: number; longBreak: number; autoBreak: boolean }) => void;
  resetTimer: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  timeLeft: 25 * 60, // 25 minutos por defecto
  initialTime: 25 * 60,
  isActive: false,
  mode: 'pomodoro',
  settings: {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    autoBreak: false,
  },

  setTimeLeft: (time) => set({ timeLeft: time }),
  setIsActive: (active) => set({ isActive: active }),
  setSettings: (settings) => set({ settings }),
  setMode: (mode) => {
    const { settings } = get();
    // Cuando cambiamos de modo, reseteamos el tiempo según el modo
    const times = {
      pomodoro: settings.pomodoro * 60,
      shortBreak: settings.shortBreak * 60,
      longBreak: settings.longBreak * 60,
    };
    set({ mode, timeLeft: times[mode], initialTime: times[mode], isActive: false });
  },
  resetTimer: () => set({ timeLeft: get().initialTime, isActive: false }),
}));