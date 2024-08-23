import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      data: [],
      setData: (data) => {
        set({ data });
      },
    }),
    {
      name: 'report-pdf-store',
      getStorage: () => localStorage,
    },
  ),
);

export { useStore };
