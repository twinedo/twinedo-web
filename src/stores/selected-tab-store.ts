import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createPersistStorage } from "./storage";

interface SelectedTabState {
  selectedTab: "mobile" | "website";
}

interface SelectedTabAction {
  setSelectedTab: (selectedTab: "mobile" | "website") => void;
}

const storage = createPersistStorage<SelectedTabState>();

const useSelectedTabStore = create<SelectedTabState & SelectedTabAction>()(
  persist(
    (set) => ({
      selectedTab: "mobile",
      setSelectedTab: (selectedTab: "mobile" | "website") => set({ selectedTab }),
    }),
    {
      name: "selected-tab-twin-web-storage",
      storage,
    }
  )
);

export default useSelectedTabStore;
