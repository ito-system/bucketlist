import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const INVITE_EXPIRY_DAYS = 7;
const CODE_LENGTH = 6;

/**
 * 紛らわしい文字（0/O、1/I/l）を除いた英数字でコードを生成する
 */
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(
    { length: CODE_LENGTH },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join('');
}

export type InviteResult = {
  listId: string;
  listTitle: string;
};

export const inviteService = {
  /**
   * 招待コードを生成して Firestore に保存し、コード文字列を返す。
   * 衝突した場合は最大 5 回リトライする。
   */
  async createInviteCode(listId: string, createdBy: string): Promise<string> {
    let code = generateCode();

    for (let i = 0; i < 5; i++) {
      const existing = await getDoc(doc(db, 'invites', code));
      if (!existing.exists()) break;
      code = generateCode();
    }

    const expiresAt = Timestamp.fromDate(
      new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    );

    await setDoc(doc(db, 'invites', code), {
      listId,
      createdBy,
      createdAt: serverTimestamp(),
      expiresAt,
      usedBy: [],
    });

    return code;
  },

  /**
   * 招待コードを検証してリストに参加させる。
   * 成功時はリスト情報を返し、失敗時は日本語エラーをスローする。
   */
  async joinByCode(code: string, userId: string): Promise<InviteResult> {
    const inviteRef = doc(db, 'invites', code.toUpperCase().trim());
    const inviteSnap = await getDoc(inviteRef);

    if (!inviteSnap.exists()) {
      throw new Error('招待コードが見つかりません');
    }

    const invite = inviteSnap.data();

    if ((invite.expiresAt as Timestamp).toDate() < new Date()) {
      throw new Error('招待コードの有効期限が切れています');
    }

    const listRef = doc(db, 'lists', invite.listId);
    const listSnap = await getDoc(listRef);

    if (!listSnap.exists()) {
      throw new Error('リストが見つかりません（削除された可能性があります）');
    }

    const listData = listSnap.data();

    if ((listData.memberIds as string[]).includes(userId)) {
      throw new Error('すでにこのリストのメンバーです');
    }

    // メンバーに追加
    await updateDoc(listRef, {
      memberIds: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    });

    // 使用済みとしてマーク（招待コードは使い捨てにしない設計なので usedBy のみ記録）
    await updateDoc(inviteRef, {
      usedBy: arrayUnion(userId),
    });

    return { listId: invite.listId, listTitle: listData.title };
  },
};
