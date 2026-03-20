import { create } from 'zustand';
import {
  itemService,
  type CreateItemInput,
  type UpdateItemInput,
} from '@/features/list/services/itemService';
import type { Item } from '@/types';

type ItemState = {
  items: Item[];
  isLoading: boolean;
  _unsubscribe: (() => void) | null;
  subscribe: (listId: string) => void;
  unsubscribe: () => void;
  createItem: (listId: string, input: CreateItemInput) => Promise<void>;
  updateItem: (
    listId: string,
    itemId: string,
    input: UpdateItemInput,
    currentStatus?: Item['status'],
  ) => Promise<void>;
  deleteItem: (
    listId: string,
    itemId: string,
    imageURL: string | null,
  ) => Promise<void>;
};

export const useItemStore = create<ItemState>((set, get) => ({
  items: [],
  isLoading: false,
  _unsubscribe: null,

  subscribe: (listId) => {
    get()._unsubscribe?.();
    set({ isLoading: true });

    const unsub = itemService.subscribeToListItems(listId, (items) => {
      set({ items, isLoading: false });
    });
    set({ _unsubscribe: unsub });
  },

  unsubscribe: () => {
    get()._unsubscribe?.();
    set({ _unsubscribe: null, items: [], isLoading: false });
  },

  createItem: async (listId, input) => {
    await itemService.createItem(listId, input);
  },

  updateItem: async (listId, itemId, input, currentStatus) => {
    await itemService.updateItem(listId, itemId, input, currentStatus);
  },

  deleteItem: async (listId, itemId, imageURL) => {
    await itemService.deleteItem(listId, itemId, imageURL);
  },
}));
