import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
// 1. Import thêm initializeAuth và getReactNativePersistence
import { 
  getAuth, 
  Auth, 
  onIdTokenChanged, 
  initializeAuth, 
  getReactNativePersistence 
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { saveFirebaseAuthToken, clearFirebaseAuthToken } from "../database/storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
  
  onIdTokenChanged(auth, async (user) => {
    if (user) {
      console.log("🚀 User logged in, saving token...");
      const token = await user.getIdToken();
      await saveFirebaseAuthToken(token);
    } else {
      console.log("🚪 User logged out, clearing token...");
      await clearFirebaseAuthToken();
    }
  });
} else {
  app = getApp();
  auth = getAuth(app);
}

const db: Firestore = getFirestore(app);

export { auth, db };
