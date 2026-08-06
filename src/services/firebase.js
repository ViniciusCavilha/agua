import { initializeApp, getApps } from 'firebase/app';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithPopup,
  reload,
  sendEmailVerification,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { deleteDoc, doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);

const app = hasFirebaseConfig ? getApps()[0] || initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

if (auth) {
  auth.languageCode = 'pt-BR';
  setPersistence(auth, browserLocalPersistence);
}

const ensureFirebase = () => {
  if (!auth || !db) {
    throw new Error('Firebase ainda nao configurado. Preencha o arquivo .env com as chaves do seu projeto.');
  }
};

export const isFirebaseReady = () => hasFirebaseConfig;

export const getCurrentUser = () => auth?.currentUser || null;

export const watchAuthUser = (callback) => {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
};

export const buildAccountFromUser = (user, extra = {}) => ({
  name: extra.name || user.displayName || '',
  phone: extra.phone || user.phoneNumber || '',
  email: user.email || extra.email || '',
  company: extra.company || '',
  unit: extra.unit || '',
  role: extra.role || '',
  avatarColor: extra.avatarColor || '#1ca7a0',
  avatarImage: extra.avatarImage || user.photoURL || '',
  emailAlerts: extra.emailAlerts ?? true,
  weeklyReport: extra.weeklyReport ?? true,
  reportFrequency: extra.reportFrequency || 'Semanal',
  emailVerified: extra.emailVerified ?? false,
});

export const isProfileComplete = (profile) => {
  return Boolean(profile?.name && profile?.email && profile?.phone && profile?.company && profile?.role);
};

export const getUserProfile = async (uid) => {
  ensureFirebase();
  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.exists() ? snapshot.data() : null;
};

export const saveUserProfile = async (uid, profile) => {
  ensureFirebase();
  await setDoc(
    doc(db, 'users', uid),
    {
      ...profile,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const loginWithEmail = async (email, password) => {
  ensureFirebase();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await reload(credential.user);
  const profile = await getUserProfile(credential.user.uid);
  return buildAccountFromUser(credential.user, profile || {});
};

export const createFirebaseAccount = async ({ name, email, password, phone, company, unit, role, avatarColor, avatarImage }) => {
  ensureFirebase();
  const currentUser = auth.currentUser;
  const isGoogleUser = currentUser?.providerData.some((provider) => provider.providerId === 'google.com');
  const credential = isGoogleUser ? { user: currentUser } : await createUserWithEmailAndPassword(auth, email, password);

  if (credential.user.displayName !== name) {
    await updateProfile(credential.user, { displayName: name });
  }

  const profile = buildAccountFromUser(credential.user, {
    name,
    phone,
    company,
    unit,
    role,
    avatarColor,
    avatarImage,
    emailVerified: false,
  });

  await saveUserProfile(credential.user.uid, {
    ...profile,
    createdAt: serverTimestamp(),
  });

  return profile;
};

export const loginWithGoogle = async () => {
  ensureFirebase();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const credential = await signInWithPopup(auth, provider);
  await reload(credential.user);
  const storedProfile = await getUserProfile(credential.user.uid);
  const profile = buildAccountFromUser(credential.user, storedProfile || {});

  return {
    account: profile,
    profileComplete: isProfileComplete(storedProfile),
  };
};

export const sendCurrentEmailVerification = async () => {
  ensureFirebase();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('Entre na conta antes de solicitar a verificacao.');
  }

  if (currentUser.emailVerified) {
    return {
      alreadyVerifiedByFirebase: true,
      sent: false,
      providers: currentUser.providerData.map((provider) => provider.providerId),
    };
  }

  await sendEmailVerification(currentUser, {
    handleCodeInApp: false,
    url: `${window.location.origin}${window.location.pathname}`,
  });

  return {
    alreadyVerifiedByFirebase: false,
    sent: true,
    providers: currentUser.providerData.map((provider) => provider.providerId),
  };
};

export const refreshCurrentUser = async () => {
  ensureFirebase();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return false;
  }

  await reload(currentUser);
  return currentUser.emailVerified;
};

export const getCurrentProviderIds = () => {
  return auth?.currentUser?.providerData.map((provider) => provider.providerId) || [];
};

export const confirmCurrentGoogleAccount = async () => {
  ensureFirebase();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('Entre na conta antes de confirmar o Google.');
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const credential = await reauthenticateWithPopup(currentUser, provider);

  return credential.user.uid === currentUser.uid && credential.user.email === currentUser.email;
};

export const logoutFirebase = async () => {
  if (auth) {
    await signOut(auth);
  }
};

export const deleteFirebaseAccount = async () => {
  ensureFirebase();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return;
  }

  await deleteDoc(doc(db, 'users', currentUser.uid));
  await deleteUser(currentUser);
};
