import { create } from 'zustand';
import { listService } from '@/features/list/services/listService';
import type { List } from '@/types';

type ListState = {
  lists: List[];
  isLoading: boolean;
  _unsubscribe: (() => void) | null;
  subscribe: (userId: string) => void;
  unsubscribe: () => void;
  createList: (title: string, ownerId: string) => Promise<string>;
  deleteList: (listId: string) => Promise<void>;
};

export const useListStore = create<ListState>((set, get) => ({
  lists: [],
  isLoading: false,
  _unsubscribe: null,

  subscribe: (userId) => {
    // 既存の購読があれば先に解除
    get()._unsubscribe?.();
    set({ isLoading: true });

    const unsub = listService.subscribeToUserLists(userId, (lists) => {
      set({ lists, isLoading: false });
    });
    set({ _unsubscribe: unsub });
  },

  unsubscribe: () => {
    get()._unsubscribe?.();
    set({ _unsubscribe: null, lists: [], isLoading: false });
  },

  createList: async (title, ownerId) => {
    return listService.createList(title, ownerId);
  },

  deleteList: async (listId) => {
    await listService.deleteList(listId);
  },
}));
