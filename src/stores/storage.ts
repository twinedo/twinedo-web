import { PersistStorage } from "zustand/middleware";

export const createPersistStorage = <T>(): PersistStorage<T> => ({
  getItem: (name) => {
    const str = localStorage.getItem(name);
    return str ? JSON.parse(str) : null;
  },
  setItem: (name, value) => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
});
