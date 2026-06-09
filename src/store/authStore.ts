import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/types';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';

type AuthState = {
  user: User | null;
  isLoading: boolean;
  /** 新規登録直後のみ true。プラン選択画面を表示したら false にする */
  isNewUser: boolean;
  clearNewUser: () => void;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  /**
   * expo-auth-session の authorization code フロー後に取得したトークンを渡す。
   * idToken と accessToken のどちらか一方があれば動作する。
   */
  signInWithGoogle: (
    idToken: string | null,
    accessToken: string | null,
  ) => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  /** 名前・メールアドレスを更新する */
  updateUserProfile: (updates: {
    displayName?: string;
    email?: string;
    currentPassword?: string;
  }) => Promise<void>;
  /** 現在のパスワードが正しいか Firebase で照合する（変更は行わない） */
  verifyCurrentPassword: (password: string) => Promise<void>;
  /** 現在のパスワードで再認証してから新しいパスワードに変更する */
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  /** RevenueCat 購入後に planType を premium に更新してストアを再フェッチする（purchaseStore から呼ぶ） */
  refreshUser: () => Promise<void>;
  /** アカウントとすべての関連データを削除する */
  deleteAccount: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => {
  // ストア生成時に Firebase の認証状態リスナーを起動する。
  // Zustand の create は一度だけ呼ばれるため、リスナーの重複登録は起きない。
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      set({ user: null, isLoading: false });
      return;
    }

    try {
      const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userSnap.exists()) {
        set({ user: userSnap.data() as User, isLoading: false });
        // RevenueCat をユーザー UID で初期化（ネイティブビルド時のみ有効）
        import('@/features/upgrade/services/purchaseService')
          .then(({ purchaseService }) => purchaseService.initialize(firebaseUser.uid))
          .catch(() => {/* Expo Go では react-native-purchases が利用不可 */});
      } else {
        // Firestore ドキュメントが存在しない（初回 Google ログイン直後など）は
        // signInWithGoogle 側でドキュメント作成後に onAuthStateChanged が再発火する
        set({ user: null, isLoading: false });
      }
    } catch {
      set({ user: null, isLoading: false });
    }
  });

  return {
    user: null,
    isLoading: true,
    isNewUser: false,
    clearNewUser: () => set({ isNewUser: false }),

    signInWithEmail: async (email, password) => {
      const { user: fbUser } = await signInWithEmailAndPassword(auth, email, password);
      // Firestore にユーザードキュメントが存在するか確認する。
      // 存在しない場合（データ不整合など）はサインアウトしてエラーをthrowする。
      const userSnap = await getDoc(doc(db, 'users', fbUser.uid));
      if (!userSnap.exists()) {
        await firebaseSignOut(auth);
        throw Object.assign(new Error(), { code: 'auth/user-not-found' });
      }
      // onAuthStateChanged が user をセットするのでここでは何もしない
    },

    signUpWithEmail: async (email, password, displayName) => {
      const { user: fbUser } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(fbUser, { displayName });

      const userRef = doc(db, 'users', fbUser.uid);
      await setDoc(userRef, {
        uid: fbUser.uid,
        email,
        displayName,
        planType: 'free',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // onAuthStateChanged は createUserWithEmailAndPassword 直後に発火するため、
      // Firestore への書き込みと競合して user: null になる場合がある。
      // setDoc 完了後に改めて取得してセットすることで競合を解消する。
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        set({ user: snap.data() as User, isNewUser: true });
      }
    },

    signInWithGoogle: async (idToken, accessToken) => {
      const credential = GoogleAuthProvider.credential(idToken, accessToken);
      const { user: fbUser } = await signInWithCredential(auth, credential);

      const userRef = doc(db, 'users', fbUser.uid);
      let userSnap = await getDoc(userRef);
      const isFirstSignIn = !userSnap.exists();
      if (isFirstSignIn) {
        await setDoc(userRef, {
          uid: fbUser.uid,
          email: fbUser.email ?? '',
          displayName: fbUser.displayName ?? '',
          planType: 'free',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        userSnap = await getDoc(userRef);
      }
      if (userSnap.exists()) {
        set({ user: userSnap.data() as User, isNewUser: isFirstSignIn });
      }
    },

    signInWithApple: async () => {
      const rawNonce = generateNonce(32);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce,
      );

      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      const { identityToken, fullName, email } = appleCredential;
      if (!identityToken) throw new Error('identityToken is null');

      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({ idToken: identityToken, rawNonce });
      const { user: fbUser } = await signInWithCredential(auth, credential);

      const userRef = doc(db, 'users', fbUser.uid);
      let userSnap = await getDoc(userRef);
      const isFirstSignIn = !userSnap.exists();
      if (isFirstSignIn) {
        const displayName =
          [fullName?.givenName, fullName?.familyName].filter(Boolean).join(' ') ||
          (fbUser.email ?? '').split('@')[0];
        await setDoc(userRef, {
          uid: fbUser.uid,
          email: email ?? fbUser.email ?? '',
          displayName,
          planType: 'free',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        userSnap = await getDoc(userRef);
      }
      if (userSnap.exists()) {
        set({ user: userSnap.data() as User, isNewUser: isFirstSignIn });
      }
    },

    signOut: async () => {
      await firebaseSignOut(auth);
    },

    updateUserProfile: async ({ displayName, email, currentPassword }) => {
      const fbUser = auth.currentUser;
      if (!fbUser) throw new Error('ログインが必要です');

      const authUpdates: { displayName?: string } = {};
      const firestoreUpdates: Record<string, unknown> = { updatedAt: serverTimestamp() };

      if (displayName !== undefined) {
        authUpdates.displayName = displayName;
        firestoreUpdates.displayName = displayName;
      }

      if (Object.keys(authUpdates).length > 0) {
        await updateProfile(fbUser, authUpdates);
      }

      // メールアドレス変更は再認証が必要
      if (email && email !== fbUser.email) {
        if (!currentPassword) throw new Error('メール変更には現在のパスワードが必要です');
        const credential = EmailAuthProvider.credential(fbUser.email!, currentPassword);
        await reauthenticateWithCredential(fbUser, credential);
        await updateEmail(fbUser, email);
        firestoreUpdates.email = email;
      }

      const userRef = doc(db, 'users', fbUser.uid);
      await updateDoc(userRef, firestoreUpdates);

      const snap = await getDoc(userRef);
      if (snap.exists()) {
        set({ user: snap.data() as User });
      }
    },

    verifyCurrentPassword: async (password) => {
      const fbUser = auth.currentUser;
      if (!fbUser || !fbUser.email) throw new Error('ログインが必要です');
      const credential = EmailAuthProvider.credential(fbUser.email, password);
      await reauthenticateWithCredential(fbUser, credential);
    },

    changePassword: async (currentPassword, newPassword) => {
      const fbUser = auth.currentUser;
      if (!fbUser || !fbUser.email) throw new Error('ログインが必要です');

      const credential = EmailAuthProvider.credential(fbUser.email, currentPassword);
      await reauthenticateWithCredential(fbUser, credential);
      await updatePassword(fbUser, newPassword);
    },

    refreshUser: async () => {
      const fbUser = auth.currentUser;
      if (!fbUser) return;
      const snap = await getDoc(doc(db, 'users', fbUser.uid));
      if (snap.exists()) {
        set({ user: snap.data() as User });
      }
    },

    deleteAccount: async () => {
      const fbUser = auth.currentUser;
      if (!fbUser) throw new Error('ログインが必要です');
      const uid = fbUser.uid;

      // 1. タグをすべて削除
      const { getDocs, collection, deleteDoc } = await import('firebase/firestore');
      const tagsSnap = await getDocs(collection(db, 'users', uid, 'tags'));
      await Promise.all(tagsSnap.docs.map((d) => deleteDoc(d.ref)));

      // 2. ユーザードキュメントを削除
      await deleteDoc(doc(db, 'users', uid));

      // 3. Firebase Auth アカウントを削除（セッションが古い場合は requires-recent-login エラーが出る）
      await fbUser.delete();

      set({ user: null });
    },
  };
});

function generateNonce(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomBytes = Crypto.getRandomBytes(length);
  return Array.from(randomBytes)
    .map((byte) => charset[byte % charset.length])
    .join('');
}
