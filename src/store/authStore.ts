import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
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
  };
});
