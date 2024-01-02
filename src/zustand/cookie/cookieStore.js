import create from 'zustand';

const useStore = create((set) => ({
  cookie: sessionStorage.getItem('cookie'),
  setCookie: (data) => {
    set({ cookie: data });
  },
}));

export { useStore };