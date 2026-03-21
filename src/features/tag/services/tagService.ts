import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Tag } from '@/types';

export type CreateTagInput = {
  name: string;
  color: string;
};

export const tagService = {
  subscribeToUserTags(uid: string, onUpdate: (tags: Tag[]) => void): () => void {
    const q = query(
      collection(db, 'users', uid, 'tags'),
      orderBy('createdAt', 'asc'),
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const tags = snapshot.docs.map((d) => ({
          ...d.data(),
          tagId: d.id,
        })) as Tag[];
        onUpdate(tags);
      },
      (error) => {
        if (error.code !== 'permission-denied') {
          console.error('Tag subscription error:', error);
        }
      },
    );
  },

  async createTag(uid: string, input: CreateTagInput): Promise<string> {
    const docRef = await addDoc(collection(db, 'users', uid, 'tags'), {
      name: input.name,
      color: input.color,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateTag(uid: string, tagId: string, input: Partial<CreateTagInput>): Promise<void> {
    await updateDoc(doc(db, 'users', uid, 'tags', tagId), {
      ...input,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteTag(uid: string, tagId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', uid, 'tags', tagId));
  },
};
