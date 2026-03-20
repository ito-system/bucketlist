import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ─── 環境変数バリデーション ────────────────────────────────────────────────────

const {
  EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID,
} = process.env;

const requiredEnvVars = {
  EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `Firebase の環境変数が不足しています: ${missingVars.join(', ')}\n` +
      '.env.example を参考に .env ファイルを作成してください。',
  );
}

// ─── Firebase 初期化 ──────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: EXPO_PUBLIC_FIREBASE_APP_ID!,
};

// Expo の Fast Refresh / HMR で重複初期化されないよう既存インスタンスを再利用する
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
