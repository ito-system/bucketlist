import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  arrayRemove,
  getDocs,
  serverTimestamp,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { List } from '@/types';

export const listService = {
  /**
   * ユーザーが参加しているリストをリアルタイム購読する。
   * 返り値の関数を呼ぶことで購読を解除できる。
   */
  subscribeToUserLists(
    userId: string,
    onUpdate: (lists: List[]) => void,
  ): () => void {
    const q = query(
      collection(db, 'lists'),
      where('memberIds', 'array-contains', userId),
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const lists = snapshot.docs.map((d) => ({
          ...d.data(),
          listId: d.id,
        })) as List[];
        // 新しい順に並び替え
        lists.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
        onUpdate(lists);
      },
      (error) => {
        if (error.code !== 'permission-denied') {
          console.error('List subscription error:', error);
        }
      },
    );
  },

  async createList(title: string, ownerId: string, emoji?: string): Promise<string> {
    const ref = await addDoc(collection(db, 'lists'), {
      title,
      ...(emoji ? { emoji } : {}),
      ownerId,
      memberIds: [ownerId],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  async updateList(listId: string, title: string, emoji: string | null): Promise<void> {
    await updateDoc(doc(db, 'lists', listId), {
      title,
      emoji: emoji !== null ? emoji : deleteField(),
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * リストを削除する。
   * サブコレクションのアイテムは親を消しても残るため先に削除する。
   * アイテム削除の権限チェックにリスト本体を参照するので、リスト本体は最後に消す。
   */
  async deleteList(listId: string): Promise<void> {
    const itemsSnap = await getDocs(collection(db, 'lists', listId, 'items'));
    await Promise.all(itemsSnap.docs.map((d) => deleteDoc(d.ref)));
    await deleteDoc(doc(db, 'lists', listId));
  },

  /**
   * メンバー本人がリストから退出する（オーナーは不可）。
   * 退出したメンバーが追加したアイテムはリストに残る。
   */
  async leaveList(listId: string, userId: string): Promise<void> {
    await updateDoc(doc(db, 'lists', listId), {
      memberIds: arrayRemove(userId),
      updatedAt: serverTimestamp(),
    });
  },
};
