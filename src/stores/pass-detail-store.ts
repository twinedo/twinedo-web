import { Project } from "@/shared";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createPersistStorage } from "./storage";

interface PassDataState {
  data: Project;
}

interface PassDataAction {
  setData: (data: Project) => void;
}

export const initialPassDataState: Project = {
	bucket: '',
	description: [''],
	display: '',
	id: '',
	key: '',
	link_appstore: '',
	link_playstore: '',
	link_website: '',
	project_name: '',
	platform: 'mobile',
	tag: '',
	year: '',
	createdAt: '',
	updatedAt: '',
}

const storage = createPersistStorage<PassDataState>();

const usePassDetailStore = create<PassDataState & PassDataAction>()(
  persist(
    (set) => ({
      data: initialPassDataState,
      setData: (data: Project) => set({ data }),
    }),
    {
      name: "pass-detail-twin-web-storage",
      storage,
    }
  )
);

export default usePassDetailStore;
