import create from 'zustand';

const useStore = create((set) => ({
  data: null,
  setTimezone: (data) => {
    set({ data });
  },
}));

export { useStore };
