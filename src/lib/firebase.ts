import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, type Persistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// ─── [M-4] Firebase App Check について ────────────────────────────────────────
//
// React Native での App Check は JS SDK ではなくネイティブ設定が必要。
// 以下の手順でセットアップする（本番リリース前に必須）:
//
// 1. `npm install @react-native-firebase/app @react-native-firebase/app-check`
// 2. iOS: DeviceCheck を有効化（Apple Developer Console）
// 3. Android: Play Integrity を有効化（Google Play Console）
// 4. Firebase Console → App Check → アプリを登録 → 強制モードをオン
// 5. Firestore / Functions の「App Check を強制」をオンにする
// ──────────────────────────────────────────────────────────────────────────────

// ─── Firebase 初期化 ──────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyB6xNghzSFuAnWvTQ21aFERgbXKH313wx8',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'bucketlist-c6ecf.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'bucketlist-c6ecf',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'bucketlist-c6ecf.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '838187642905',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '1:838187642905:ios:c6c9bd6a381f88dceb7a88',
};

// getReactNativePersistence は @firebase/auth の React Native ビルドにのみ存在する。
// Metro は package.json の "react-native" フィールドで RN ビルドを解決するため
// 実行時は正常に動作するが、TypeScript はブラウザ型を参照するため require で回避する。
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getReactNativePersistence } = require('@firebase/auth') as {
  getReactNativePersistence: (storage: typeof ReactNativeAsyncStorage) => Persistence;
};

// Expo の Fast Refresh / HMR で重複初期化されないよう既存インスタンスを再利用する。
// Auth は初回のみ initializeAuth で永続化設定し、HMR 時は getAuth で既存インスタンスを返す。
const isFirstInit = getApps().length === 0;
const app = isFirstInit ? initializeApp(firebaseConfig) : getApp();

export const auth = isFirstInit
  ? initializeAuth(app, { persistence: getReactNativePersistence(ReactNativeAsyncStorage) })
  : getAuth(app);
export const db = getFirestore(app);

export default app;
