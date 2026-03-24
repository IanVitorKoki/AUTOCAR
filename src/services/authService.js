import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { serializeDoc } from '../lib/firestore';
import { auth, db } from '../firebase';

export async function registerUser({ name, email, password }) {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const normalizedName = name.trim();

  await updateProfile(credential.user, {
    displayName: normalizedName,
  });

  await setDoc(
    doc(db, 'users', credential.user.uid),
    {
      uid: credential.user.uid,
      name: normalizedName,
      email: email.trim().toLowerCase(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );

  return {
    uid: credential.user.uid,
    name: normalizedName,
    email: credential.user.email,
  };
}

export async function loginUser({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export function observeAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserProfile(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid));

  if (!snapshot.exists()) {
    return null;
  }

  const profile = serializeDoc(snapshot);
  return {
    ...profile,
    uid: profile.uid ?? profile.id,
  };
}
