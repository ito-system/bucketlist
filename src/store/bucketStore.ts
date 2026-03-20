import { create } from "zustand";
import type { BucketItem } from "@/shared/types";

type BucketState = {
  items: BucketItem[];
  isLoading: boolean;
  setItems: (items: BucketItem[]) => void;
  addItem: (item: BucketItem) => void;
  updateItem: (id: string, updates: Partial<BucketItem>) => void;
  removeItem: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
};

export const useBucketStore = create<BucketState>((set) => ({
  items: [],
  isLoading: false,
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [item, ...state.items] })),
  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
}));
