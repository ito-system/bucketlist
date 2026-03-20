import { create } from 'zustand';
import { tagService, type CreateTagInput } from '@/features/tag/services/tagService';
import type { Tag } from '@/types';

type TagState = {
  tags: Tag[];
  isLoading: boolean;
  _unsubscribe: (() => void) | null;
  subscribe: (uid: string) => void;
  unsubscribe: () => void;
  createTag: (uid: string, input: CreateTagInput) => Promise<void>;
  updateTag: (uid: string, tagId: string, input: Partial<CreateTagInput>) => Promise<void>;
  deleteTag: (uid: string, tagId: string) => Promise<void>;
};

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],
  isLoading: false,
  _unsubscribe: null,

  subscribe: (uid) => {
    get()._unsubscribe?.();
    set({ isLoading: true });
    const unsub = tagService.subscribeToUserTags(uid, (tags) => {
      set({ tags, isLoading: false });
    });
    set({ _unsubscribe: unsub });
  },

  unsubscribe: () => {
    get()._unsubscribe?.();
    set({ _unsubscribe: null, tags: [], isLoading: false });
  },

  createTag: async (uid, input) => {
    await tagService.createTag(uid, input);
  },

  updateTag: async (uid, tagId, input) => {
    await tagService.updateTag(uid, tagId, input);
  },

  deleteTag: async (uid, tagId) => {
    await tagService.deleteTag(uid, tagId);
  },
}));
