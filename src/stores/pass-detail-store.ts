import { Project } from "@/shared";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createPersistStorage } from "./storage";

interface PassDataState {
  data: Project | null;
}

interface PassDataAction {
  setData: (data: Project | null) => void;
}

const storage = createPersistStorage<PassDataState>();

const usePassDetailStore = create<PassDataState & PassDataAction>()(
  persist(
    (set) => ({
      data: null,
      setData: (data: Project | null) => set({ data }),
    }),
    {
      name: "pass-detail-twin-web-storage",
      storage,
    }
  )
);

export default usePassDetailStore;
