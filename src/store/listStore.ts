import { create } from 'zustand';
import { listService } from '@/features/list/services/listService';
import type { List } from '@/types';

type ListState = {
  lists: List[];
  isLoading: boolean;
  _unsubscribe: (() => void) | null;
  subscribe: (userId: string) => void;
  unsubscribe: () => void;
  createList: (title: string, ownerId: string, emoji?: string) => Promise<string>;
  updateList: (listId: string, title: string, emoji: string | null) => Promise<void>;
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

  createList: async (title, ownerId, emoji) => {
    return listService.createList(title, ownerId, emoji);
  },

  updateList: async (listId, title, emoji) => {
    await listService.updateList(listId, title, emoji);
  },

  deleteList: async (listId) => {
    await listService.deleteList(listId);
  },
}));
