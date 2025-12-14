import { create } from "zustand";
import { StreamCategory } from "@/data/streams";

interface StreamFeedState {
  activeCategory: StreamCategory;
  setActiveCategory: (category: StreamCategory) => void;
}

export const useStreamFeedStore = create<StreamFeedState>((set) => ({
  activeCategory: "Live",
  setActiveCategory: (category) => set({ activeCategory: category }),
}));
