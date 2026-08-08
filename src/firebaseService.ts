import { db } from './firebase';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs
} from 'firebase/firestore';


// Save admin config
export async function saveFirebaseConfig(config: any) {
  await setDoc(
    doc(db, 'appData', 'adminConfig'),
    config
  );
}


// Load admin config
export async function loadFirebaseConfig() {
  const snap = await getDoc(
    doc(db, 'appData', 'adminConfig')
  );

  if (snap.exists()) {
    return snap.data();
  }

  return null;
}

// Save admin config to Firestore
export async function saveAdminConfigFirestore(config: any) {
  await setDoc(
    doc(db, 'appData', 'adminConfig'),
    {
      ...config,
      lastUpdated: Date.now()
    },
    { merge: true }
  );
}


// Load admin config from Firestore
export async function loadAdminConfigFirestore() {
  const snap = await getDoc(
    doc(db, 'appData', 'adminConfig')
  );

  if (snap.exists()) {
    return snap.data();
  }

  return null;
}
// Save user
export async function saveFirebaseUser(
  memberId: string,
  user: any
) {
  await setDoc(
    doc(db, 'users', memberId),
    user,
    { merge: true }
  );
}


// Get all users
export async function getFirebaseUsers() {
  const snap = await getDocs(
    collection(db, 'users')
  );

  return snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));;
}
