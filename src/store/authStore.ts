import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';
import type { User } from '@/types';

type AuthState = {
  user: User | null;
  isLoading: boolean;
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
  signOut: () => Promise<void>;
  /** 名前・メールアドレス・アイコン画像（ローカル URI）を更新する */
  updateUserProfile: (updates: {
    displayName?: string;
    email?: string;
    photoUri?: string;
    currentPassword?: string;
  }) => Promise<void>;
  /** 現在のパスワードが正しいか Firebase で照合する（変更は行わない） */
  verifyCurrentPassword: (password: string) => Promise<void>;
  /** 現在のパスワードで再認証してから新しいパスワードに変更する */
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => {
  // ストア生成時に Firebase の認証状態リスナーを起動する。
  // Zustand の create は一度だけ呼ばれるため、リスナーの重複登録は起きない。
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      set({ user: null, isLoading: false });
      return;
    }

    const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userSnap.exists()) {
      set({ user: userSnap.data() as User, isLoading: false });
    } else {
      // Firestore ドキュメントが存在しない（初回 Google ログイン直後など）は
      // signInWithGoogle 側でドキュメント作成後に onAuthStateChanged が再発火する
      set({ user: null, isLoading: false });
    }
  });

  return {
    user: null,
    isLoading: true,

    signInWithEmail: async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password);
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
        photoURL: null,
        planType: 'free',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // onAuthStateChanged は createUserWithEmailAndPassword 直後に発火するため、
      // Firestore への書き込みと競合して user: null になる場合がある。
      // setDoc 完了後に改めて取得してセットすることで競合を解消する。
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        set({ user: snap.data() as User });
      }
    },

    signInWithGoogle: async (idToken, accessToken) => {
      const credential = GoogleAuthProvider.credential(idToken, accessToken);
      const { user: fbUser } = await signInWithCredential(auth, credential);

      const userRef = doc(db, 'users', fbUser.uid);
      let userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: fbUser.uid,
          email: fbUser.email ?? '',
          displayName: fbUser.displayName ?? '',
          photoURL: fbUser.photoURL ?? null,
          planType: 'free',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        userSnap = await getDoc(userRef);
      }
      if (userSnap.exists()) {
        set({ user: userSnap.data() as User });
      }
    },

    signOut: async () => {
      await firebaseSignOut(auth);
    },

    updateUserProfile: async ({ displayName, email, photoUri, currentPassword }) => {
      const fbUser = auth.currentUser;
      if (!fbUser) throw new Error('ログインが必要です');

      const authUpdates: { displayName?: string; photoURL?: string } = {};
      const firestoreUpdates: Record<string, unknown> = { updatedAt: serverTimestamp() };

      if (displayName !== undefined) {
        authUpdates.displayName = displayName;
        firestoreUpdates.displayName = displayName;
      }

      // アイコン画像: Storage にアップロードしてダウンロード URL を取得
      if (photoUri) {
        const response = await fetch(photoUri);
        const blob = await response.blob();
        const storageRef = ref(storage, `avatars/${fbUser.uid}.jpg`);
        await uploadBytes(storageRef, blob);
        const photoURL = await getDownloadURL(storageRef);
        authUpdates.photoURL = photoURL;
        firestoreUpdates.photoURL = photoURL;
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
  };
});
