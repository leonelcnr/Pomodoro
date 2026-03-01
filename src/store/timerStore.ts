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
  // Para la sincronización (nuevo)
  setTimerState: (state: { timeLeft: number; isActive: boolean; mode: 'pomodoro' | 'shortBreak' | 'longBreak'; updatedAt?: string }) => void;
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
  setSettings: (settings) => set((state) => {
    const updates: Partial<TimerState> = { settings };
    
    if (!state.isActive) {
      const times = {
        pomodoro: settings.pomodoro * 60,
        shortBreak: settings.shortBreak * 60,
        longBreak: settings.longBreak * 60,
      };
      updates.timeLeft = times[state.mode];
      updates.initialTime = times[state.mode];
    }

    return updates;
  }),
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
  setTimerState: (payload) => set((state) => {
    // Si viene la fecha de actualización y el reloj está activo, calculamos la desviación
    let newTimeLeft = payload.timeLeft;
    if (payload.isActive && payload.updatedAt) {
      const elapsedMilliseconds = Date.now() - new Date(payload.updatedAt).getTime();
      const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
      newTimeLeft = Math.max(0, payload.timeLeft - elapsedSeconds);
    }
    
    // Si cambia el modo por red, actualizamos también initialTime
    const times = {
        pomodoro: state.settings.pomodoro * 60,
        shortBreak: state.settings.shortBreak * 60,
        longBreak: state.settings.longBreak * 60,
    };

    return {
      timeLeft: newTimeLeft,
      isActive: payload.isActive,
      mode: payload.mode,
      initialTime: state.mode !== payload.mode ? times[payload.mode] : state.initialTime
    };
  }),
}));