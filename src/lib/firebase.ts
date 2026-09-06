import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { initializeFirestore, getFirestore, Firestore, setLogLevel, memoryLocalCache } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Suppress harmless offline/timeout logs from Cloud Firestore
try {
  setLogLevel('silent');
} catch {}

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const databaseId = firebaseConfigJson.firestoreDatabaseId || '(default)';

// Initialize Firestore with memoryLocalCache & forced long polling
// This prevents IndexedDB "Database is closing/hidden" or lock-contention exceptions
// in WebView/APK, iframes, and mobile background tab throttling.
let db: Firestore;
try {
  db = initializeFirestore(
    app,
    {
      localCache: memoryLocalCache(),
      experimentalForceLongPolling: true,
    },
    databaseId
  );
} catch {
  db = getFirestore(app, databaseId);
}

const auth: Auth = getAuth(app);

export { app, db, auth };

