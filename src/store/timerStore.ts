import { create } from 'zustand';

// Definimos los tipos de datos
interface TimerState {
  timeLeft: number;      // Tiempo restante en segundos
  initialTime: number;   // Para poder resetear (ej: 25 * 60)
  isActive: boolean;     // ¿Está corriendo el reloj?
  mode: 'pomodoro' | 'shortBreak' | 'longBreak' | 'stopwatch'; // El modo actual
  settings: {
    pomodoro: number;
    shortBreak: number;
    longBreak: number;
    autoBreak: boolean;
  };

  // Acciones (funciones que modifican el estado)
  setTimeLeft: (time: number) => void;
  setIsActive: (active: boolean) => void;
  setMode: (mode: 'pomodoro' | 'shortBreak' | 'longBreak' | 'stopwatch') => void;
  setSettings: (settings: { pomodoro: number; shortBreak: number; longBreak: number; autoBreak: boolean }) => void;
  resetTimer: () => void;
  // Para la sincronización (nuevo)
  setTimerState: (state: { timeLeft: number; isActive: boolean; mode: 'pomodoro' | 'shortBreak' | 'longBreak' | 'stopwatch'; updatedAt?: string }) => void;
  lastLocalUpdate: number;
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
  lastLocalUpdate: Date.now(),

  setTimeLeft: (time) => set({ timeLeft: time }),
  setIsActive: (active) => set({ isActive: active, lastLocalUpdate: Date.now() }),
  setSettings: (settings) => set((state) => {
    const updates: Partial<TimerState> = { settings };
    
    if (!state.isActive && state.mode !== 'stopwatch') {
      const times = {
        pomodoro: settings.pomodoro * 60,
        shortBreak: settings.shortBreak * 60,
        longBreak: settings.longBreak * 60,
      };
      updates.timeLeft = times[state.mode];
      updates.initialTime = times[state.mode];
    }
    
    updates.lastLocalUpdate = Date.now();
    return updates;
  }),
  setMode: (mode) => {
    const { settings } = get();
    // Cuando cambiamos a stopwatch, empezamos en 0. Si no, reseteamos el tiempo según el modo
    if (mode === 'stopwatch') {
      set({ mode, timeLeft: 0, initialTime: 0, isActive: false, lastLocalUpdate: Date.now() });
      return;
    }
    const times = {
      pomodoro: settings.pomodoro * 60,
      shortBreak: settings.shortBreak * 60,
      longBreak: settings.longBreak * 60,
    };
    set({ mode, timeLeft: times[mode], initialTime: times[mode], isActive: false, lastLocalUpdate: Date.now() });
  },
  resetTimer: () => set({ timeLeft: get().initialTime, isActive: false, lastLocalUpdate: Date.now() }),
  setTimerState: (payload) => set((state) => {
    // Si viene la fecha de actualización y el reloj está activo, calculamos la desviación
    let newTimeLeft = payload.timeLeft;
    if (payload.isActive && payload.updatedAt) {
      const elapsedMilliseconds = Date.now() - new Date(payload.updatedAt).getTime();
      const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
      newTimeLeft = Math.max(0, payload.timeLeft - elapsedSeconds);
    }
    
    // Si cambia el modo por red, actualizamos también initialTime
    let initialTime = state.initialTime;
    if (state.mode !== payload.mode) {
       if (payload.mode === 'stopwatch') {
           initialTime = 0;
       } else {
           initialTime = state.settings[payload.mode] * 60;
       }
    }

    return {
      timeLeft: newTimeLeft,
      isActive: payload.isActive,
      mode: payload.mode,
      initialTime
    };
  }),
}));