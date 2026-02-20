import { getStreakData, saveStreakData } from "@/lib/database";

import type { StreakData } from "@/types/reading";
import { create } from "zustand";
import { getDateString } from "@/utils/time";

const getTodayDate = (): string => getDateString(new Date());

const getYesterdayDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return getDateString(date);
};

const checkHasCompletedToday = (lastActiveDate: string | null): boolean => {
  if (!lastActiveDate) return false;
  return lastActiveDate === getTodayDate();
};

interface StreakWithStatus extends StreakData {
  hasCompletedToday: boolean;
}

interface StreakStore {
  // Estado
  isStreakLoading: boolean;
  streakData: StreakWithStatus | null;

  // Acciones de streak
  loadStreakData: () => Promise<void>;
  completeDay: () => Promise<boolean | undefined>;
  initializeStreak: (days: number, startDate?: string) => Promise<void>;
}

export const useStreakStore = create<StreakStore>((set) => ({
  // Estados iniciales
  streakData: null,
  isStreakLoading: false,

  // Cargar la racha
  loadStreakData: async () => {
    set({ isStreakLoading: true });
    try {
      const data = await getStreakData();
      if (data) {
        const hasCompletedToday = checkHasCompletedToday(data.lastActiveDate);
        set({
          streakData: { ...data, hasCompletedToday },
          isStreakLoading: false,
        });
      } else {
        set({ streakData: null, isStreakLoading: false });
      }
    } catch (error) {
      console.error("Error loading streak:", error);
      set({ isStreakLoading: false });
    }
  },

  // Completar racha del día
  completeDay: async () => {
    const { streakData } = useStreakStore.getState();

    // Si no hay racha existente, crear una nueva con 1 día
    if (!streakData) {
      const today = getTodayDate();
      const newData: StreakData = {
        currentStreak: 1,
        startDate: today,
        lastActiveDate: today,
      };
      await saveStreakData(newData);
      set({ streakData: { ...newData, hasCompletedToday: true } });
      return true;
    }

    const today = getTodayDate();
    if (streakData.lastActiveDate === today) {
      return false;
    }

    const yesterday = getYesterdayDate();
    let newStreak: number;

    if (streakData.lastActiveDate === yesterday) {
      newStreak = streakData.currentStreak + 1;
    } else {
      // Si pasó más de un día, reiniciar la racha a 1
      newStreak = 1;
    }

    const newData: StreakData = {
      currentStreak: newStreak,
      startDate: streakData.startDate || today,
      lastActiveDate: today,
    };

    await saveStreakData(newData);
    set({ streakData: { ...newData, hasCompletedToday: true } });
    return true;
  },

  // Inicializar la racha(esto es para hacerlo manualmente)
  initializeStreak: async (days: number, startDate?: string) => {
    set({ isStreakLoading: true });
    const today = getTodayDate();

    // Si startDate es provisto, usarla como está, si no usar today
    let initialDate = today;
    if (startDate) {
      // Convertir fecha de input (YYYY-MM-DD) a formato correcto
      initialDate = startDate;
    }

    const newData: StreakData = {
      currentStreak: days,
      startDate: initialDate,
      lastActiveDate: today,
    };

    try {
      await saveStreakData(newData);
      set({
        streakData: { ...newData, hasCompletedToday: true },
        isStreakLoading: false,
      });
    } catch (error) {
      console.error("Error initializing streak:", error);
      set({ isStreakLoading: false });
    }
  },
}));
