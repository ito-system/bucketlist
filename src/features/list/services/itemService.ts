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
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Item, ItemStatus } from '@/types';

export type CreateItemInput = {
  title: string;
  description?: string;
  url?: string;
  createdBy: string;
  tagIds?: string[];
};

export type UpdateItemInput = {
  title?: string;
  description?: string | null;
  url?: string | null;
  status?: ItemStatus;
  tagIds?: string[];
};

export const itemService = {
  /**
   * リストのアイテムをリアルタイム購読する。
   * Firestore は createdAt 昇順で取得し、クライアント側で order フィールドでソートする。
   */
  subscribeToListItems(
    listId: string,
    onUpdate: (items: Item[]) => void,
  ): () => void {
    const q = query(
      collection(db, 'lists', listId, 'items'),
      orderBy('createdAt', 'asc'),
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          ...d.data(),
          itemId: d.id,
        })) as Item[];
        // order フィールド昇順でソート（未設定のアイテムは末尾）
        items.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
        onUpdate(items);
      },
      (error) => {
        if (error.code !== 'permission-denied') {
          console.error('Item subscription error:', error);
        }
      },
    );
  },

  async createItem(listId: string, input: CreateItemInput, currentItemCount: number): Promise<string> {
    const docRef = await addDoc(collection(db, 'lists', listId, 'items'), {
      listId,
      title: input.title,
      description: input.description ?? null,
      url: input.url ?? null,
      imageURL: null,
      status: 'todo' satisfies ItemStatus,
      location: null,
      createdBy: input.createdBy,
      completedAt: null,
      tagIds: input.tagIds ?? [],
      order: currentItemCount,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateItem(
    listId: string,
    itemId: string,
    input: UpdateItemInput,
    currentStatus?: ItemStatus,
  ): Promise<void> {
    const data: Record<string, unknown> = { updatedAt: serverTimestamp() };

    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.url !== undefined) data.url = input.url;
    if (input.tagIds !== undefined) data.tagIds = input.tagIds;

    if (input.status !== undefined) {
      data.status = input.status;
      // done に変更 → completedAt をセット、done 以外に戻す → クリア
      if (input.status === 'done' && currentStatus !== 'done') {
        data.completedAt = Timestamp.now();
      } else if (input.status !== 'done' && currentStatus === 'done') {
        data.completedAt = null;
      }
    }

    await updateDoc(doc(db, 'lists', listId, 'items', itemId), data);
  },

  /** ドラッグ後の新しい順序を Firestore に一括保存する */
  async reorderItems(listId: string, items: Item[]): Promise<void> {
    const batch = writeBatch(db);
    items.forEach((item, index) => {
      batch.update(doc(db, 'lists', listId, 'items', item.itemId), {
        order: index,
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
  },

  async deleteItem(listId: string, itemId: string): Promise<void> {
    await deleteDoc(doc(db, 'lists', listId, 'items', itemId));
  },
};
