import { Timestamp } from 'firebase/firestore';

// ─── Plan ────────────────────────────────────────────────────────────────────

export type PlanType = 'free' | 'premium';

/**
 * プランごとの制限値。セキュリティルールと同じ値を参照するための定数。
 * ルール側の変更と乖離しないよう、この定数を UI・バリデーション両方で使う。
 */
export const PLAN_LIMITS = {
  free: {
    maxLists: 3,
    maxMembers: 2,
    maxTags: 5,
  },
  premium: {
    maxLists: Infinity,
    maxMembers: 10,
    maxTags: Infinity,
  },
} as const satisfies Record<PlanType, { maxLists: number; maxMembers: number; maxTags: number }>;

// ─── User ────────────────────────────────────────────────────────────────────

/**
 * Firestore: /users/{uid}
 *
 * ドキュメントIDは uid と同一。uid フィールドは冗長だが、
 * コレクショングループクエリ時やスプレッド展開後の参照用に保持する。
 *
 * planType の変更は Cloud Functions 経由のみ許可（セキュリティルールで強制）。
 */
export type User = {
  uid: string;
  email: string;
  displayName: string;
  planType: PlanType;
  /**
   * true の場合、RevenueCat Webhook による planType の自動更新をスキップする。
   * 特定のユーザーを料金免除にする際に使用。
   */
  isExempt?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

// ─── List ────────────────────────────────────────────────────────────────────

/**
 * Firestore: /lists/{listId}
 *
 * maxMembers フィールドは意図的に持たない。
 * オーナーのプランが変わった場合にデータとルールが乖離するリスクを避けるため、
 * 制限値は常に PLAN_LIMITS からオーナーの planType を参照して導出する。
 */
export type List = {
  listId: string;
  title: string;
  /** 絵文字アイコン（未設定時は title の頭文字を表示） */
  emoji?: string;
  ownerId: string;
  /** ownerId を含む全メンバーの uid 配列 */
  memberIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

// ─── Tag ─────────────────────────────────────────────────────────────────────

/**
 * Firestore: /users/{uid}/tags/{tagId}
 *
 * ユーザーごとに管理し、全リスト共通で使用できる。
 */
export type Tag = {
  tagId: string;
  name: string;
  /** 16進カラーコード (例: "#6366F1") */
  color: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

// ─── Item ────────────────────────────────────────────────────────────────────

export type ItemStatus = 'todo' | 'doing' | 'done';

export type ItemLocation = {
  lat: number;
  lng: number;
  name: string;
};

/**
 * Firestore: /lists/{listId}/items/{itemId}
 *
 * サブコレクション採用理由:
 *   - セキュリティルールをリストの権限に委譲できる（memberIds チェックを一か所に集約）
 *   - パスから listId が取得できるため重複保持が不要になるが、
 *     コレクショングループクエリ（collectionGroup('items')）で全リストを横断検索する
 *     ユースケースに備えて listId フィールドも保持する
 */
export type Item = {
  itemId: string;
  /** サブコレクションでも保持（collectionGroup クエリ用） */
  listId: string;
  title: string;
  description: string | null;
  url: string | null;
  /** Firebase Storage のダウンロード URL（パスではなく URL を推奨） */
  imageURL: string | null;
  status: ItemStatus;
  location: ItemLocation | null;
  /** 追加したメンバーの uid */
  createdBy: string;
  completedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  /** 手動並び替え用の順序。小さいほど先に表示。未設定は 0 扱い */
  order?: number;
  /** 付与されたタグの ID 配列 */
  tagIds?: string[];
};
