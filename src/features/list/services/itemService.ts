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
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import type { Item, ItemStatus } from '@/types';

export type CreateItemInput = {
  title: string;
  description?: string;
  url?: string;
  /** expo-image-picker が返すローカル URI */
  imageUri?: string;
  createdBy: string;
};

export type UpdateItemInput = {
  title?: string;
  description?: string | null;
  url?: string | null;
  imageUri?: string;
  status?: ItemStatus;
};

export const itemService = {
  /**
   * リストのアイテムをリアルタイム購読する。
   * createdAt 降順（新着順）で返す。
   */
  subscribeToListItems(
    listId: string,
    onUpdate: (items: Item[]) => void,
  ): () => void {
    const q = query(
      collection(db, 'lists', listId, 'items'),
      orderBy('createdAt', 'desc'),
    );
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        ...d.data(),
        itemId: d.id,
      })) as Item[];
      onUpdate(items);
    });
  },

  async createItem(listId: string, input: CreateItemInput): Promise<string> {
    let imageURL: string | null = null;
    if (input.imageUri) {
      imageURL = await itemService.uploadImage(listId, input.imageUri);
    }

    const ref = await addDoc(collection(db, 'lists', listId, 'items'), {
      listId,
      title: input.title,
      description: input.description ?? null,
      url: input.url ?? null,
      imageURL,
      status: 'todo' satisfies ItemStatus,
      location: null,
      createdBy: input.createdBy,
      completedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
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

    if (input.imageUri) {
      data.imageURL = await itemService.uploadImage(listId, input.imageUri);
    }

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

  async deleteItem(
    listId: string,
    itemId: string,
    imageURL: string | null,
  ): Promise<void> {
    // Storage の画像を先に削除（失敗してもドキュメント削除は続行）
    if (imageURL) {
      try {
        await deleteObject(ref(storage, imageURL));
      } catch {
        // 画像が既に削除済みまたは Storage パスが不正な場合を無視
      }
    }
    await deleteDoc(doc(db, 'lists', listId, 'items', itemId));
  },

  /**
   * ローカル URI の画像を Firebase Storage にアップロードし、
   * ダウンロード URL を返す。
   */
  async uploadImage(listId: string, uri: string): Promise<string> {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `items/${listId}/${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  },
};
