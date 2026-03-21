import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import axios from 'axios';

admin.initializeApp();
const db = admin.firestore();

// ─── 定数 ──────────────────────────────────────────────────────────────────────

const FREE_PLAN_LIST_LIMIT = 3;
const FREE_PLAN_TAG_LIMIT = 5;
const REVENUECAT_API_KEY = functions.config().revenuecat?.api_key ?? '';
const ENTITLEMENT_ID = 'premium';

// ─── [H-1] planType の同期（購入後にクライアントから呼び出す） ───────────────────

/**
 * RevenueCat の購入完了後にクライアントから呼び出す。
 * Admin SDK を使って planType を更新するため、Firestore Rules を迂回できる。
 *
 * デプロイ後に environment config を設定:
 *   firebase functions:config:set revenuecat.api_key="YOUR_REVENUECAT_SECRET_KEY"
 */
export const syncPremiumStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'ログインが必要です');
  }

  const uid = context.auth.uid;

  // RevenueCat REST API でエンタイトルメントを検証
  let isPremium = false;
  if (REVENUECAT_API_KEY) {
    try {
      const res = await axios.get(
        `https://api.revenuecat.com/v1/subscribers/${uid}`,
        { headers: { Authorization: `Bearer ${REVENUECAT_API_KEY}` } },
      );
      const entitlements = res.data?.subscriber?.entitlements ?? {};
      const entitlement = entitlements[ENTITLEMENT_ID];
      isPremium = !!entitlement && new Date(entitlement.expires_date ?? 0) > new Date();
    } catch (e) {
      functions.logger.error('RevenueCat API error', e);
      throw new functions.https.HttpsError('internal', '購入状態の確認に失敗しました');
    }
  }

  await db.doc(`users/${uid}`).update({
    planType: isPremium ? 'premium' : 'free',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { planType: isPremium ? 'premium' : 'free' };
});

// ─── [H-1] RevenueCat Webhook（サーバー側からの自動更新） ──────────────────────

/**
 * RevenueCat ダッシュボード → Integrations → Webhooks に以下の URL を登録:
 *   https://{region}-{project}.cloudfunctions.net/revenuecatWebhook
 * Authorization Header に RevenueCat の "Webhook Authorization" を設定する。
 */
export const revenuecatWebhook = functions.https.onRequest(async (req, res) => {
  const authHeader = req.headers.authorization ?? '';
  const expectedAuth = functions.config().revenuecat?.webhook_auth ?? '';

  if (expectedAuth && authHeader !== expectedAuth) {
    res.status(401).send('Unauthorized');
    return;
  }

  const event = req.body?.event;
  if (!event) {
    res.status(400).send('Missing event');
    return;
  }

  const uid: string | undefined = event.app_user_id;
  if (!uid) {
    res.status(200).send('No app_user_id');
    return;
  }

  const premiumEvents = [
    'INITIAL_PURCHASE',
    'RENEWAL',
    'PRODUCT_CHANGE',
    'UNCANCELLATION',
  ];
  const revokeEvents = ['CANCELLATION', 'EXPIRATION', 'BILLING_ISSUE'];

  let planType: 'free' | 'premium' | null = null;
  if (premiumEvents.includes(event.type)) planType = 'premium';
  if (revokeEvents.includes(event.type)) planType = 'free';

  if (planType) {
    await db.doc(`users/${uid}`).update({
      planType,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    functions.logger.info(`planType updated: ${uid} → ${planType}`);
  }

  res.status(200).send('OK');
});

// ─── [H-3] フリープランのリスト数上限を Cloud Functions で強制 ───────────────────

/**
 * リスト作成時にオーナーのリスト数を確認し、超過していれば削除する。
 * Firestore Rules では件数チェックができないため、このトリガーで補完する。
 */
export const enforceListLimit = functions.firestore
  .document('lists/{listId}')
  .onCreate(async (snap, context) => {
    const listData = snap.data();
    const ownerId: string = listData.ownerId;

    const userSnap = await db.doc(`users/${ownerId}`).get();
    if (!userSnap.exists) return;

    const planType = userSnap.data()?.planType ?? 'free';
    if (planType === 'premium') return;

    const listsSnap = await db
      .collection('lists')
      .where('ownerId', '==', ownerId)
      .get();

    if (listsSnap.size > FREE_PLAN_LIST_LIMIT) {
      functions.logger.warn(`List limit exceeded for ${ownerId}. Deleting ${context.params.listId}`);
      await snap.ref.delete();
    }
  });

// ─── [M-1] フリープランのタグ数上限を Cloud Functions で強制 ────────────────────

/**
 * タグ作成時にユーザーのタグ数を確認し、超過していれば削除する。
 */
export const enforceTagLimit = functions.firestore
  .document('users/{uid}/tags/{tagId}')
  .onCreate(async (snap, context) => {
    const uid: string = context.params.uid;

    const userSnap = await db.doc(`users/${uid}`).get();
    if (!userSnap.exists) return;

    const planType = userSnap.data()?.planType ?? 'free';
    if (planType === 'premium') return;

    const tagsSnap = await db
      .collection(`users/${uid}/tags`)
      .get();

    if (tagsSnap.size > FREE_PLAN_TAG_LIMIT) {
      functions.logger.warn(`Tag limit exceeded for ${uid}. Deleting ${context.params.tagId}`);
      await snap.ref.delete();
    }
  });
