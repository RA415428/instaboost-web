import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyANy4SqNk_zOYfpcRpwzw3oImnt4jnbjpo",
  authDomain: "roxyefollow.firebaseapp.com",
  projectId: "roxyefollow",
  storageBucket: "roxyefollow.firebasestorage.app",
  messagingSenderId: "941069618650",
  appId: "1:941069618650:web:a3b861e91bc64aac8444e3",
  measurementId: "G-LWQ7EBQ6PG"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);

export default app;
