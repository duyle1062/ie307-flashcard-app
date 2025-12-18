import { createContext, useContext, useState, useEffect } from "react";
import { Alert } from "react-native";
import i18n from "../i18n";
import { toFirestoreData } from "../../core/utils/mapper";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../core/config/firebaseConfig";
import {
  upsertUser,
  getUserById,
} from "../../core/database/repositories/UserRepository";
import {
  saveCurrentUserId,
  getCurrentUserId,
  clearAllData,
  clearFirebaseAuthToken,
} from "../../core/database/storage";
import { logTableData } from "../../core/utils/dbDebug";
import { getDatabase } from "../../core/database";

type AuthContextType = {
  user: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  register: (email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // onAuthStateChanged: Lắng nghe thay đổi trạng thái đăng nhập (tự động login nếu còn session)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const register = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      // 1. Tạo tài khoản trên Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      const fullUserData = {
        id: firebaseUser.uid,
        email: email,
        display_name: email.split("@")[0],
        streak_days: 0,
        daily_new_cards_limit: 25,
        daily_review_cards_limit: 50,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const cloudUserData = toFirestoreData("users", fullUserData);

      // 2. Tạo User Document trên Firestore (không có id)
      await setDoc(doc(db, "users", firebaseUser.uid), cloudUserData);

      // 3. Khởi tạo SQLite Local DB (Cần ID)
      await upsertUser(fullUserData);

      // 4. Lưu userId vào AsyncStorage (Lưu session vào AsyncStorage)
      await saveCurrentUserId(firebaseUser.uid);

      console.log("Registered successfully:", firebaseUser.uid);

      // 🐛 DEBUG: Log dữ liệu users sau khi register
      const sqliteDb = await getDatabase();
      await logTableData(sqliteDb, "users");

      // User tự động login và navigate vào app

      return true;
    } catch (error: any) {
      let msg = i18n.t("auth.registrationFailed");
      if (error.code === "auth/email-already-in-use")
        msg = i18n.t("auth.emailAlreadyInUse");
      if (error.code === "auth/weak-password")
        msg = i18n.t("auth.passwordTooWeak");
      Alert.alert(i18n.t("common.error"), msg);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Sync user data từ Firestore về SQLite
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Upsert user vào SQLite (Tải user data từ Firestore)
        await upsertUser({
          id: firebaseUser.uid,
          email: userData.email,
          display_name: userData.display_name || userData.name,
          picture: userData.picture || userData.profile_picture_url,
          streak_days: userData.streak_days || 0,
          last_active_date: userData.last_active_date,
          daily_new_cards_limit: userData.daily_new_cards_limit || 25,
          daily_review_cards_limit: userData.daily_review_cards_limit || 50,
        });

        // Lưu userId vào AsyncStorage
        await saveCurrentUserId(firebaseUser.uid);

        console.log("Login successful, data synced:", firebaseUser.uid);

        // 🐛 DEBUG: Log dữ liệu users sau khi login (Lưu session vào AsyncStorage)
        const sqliteDb = await getDatabase();
        await logTableData(sqliteDb, "users");
      }

      return true;
    } catch (error: any) {
      Alert.alert(
        i18n.t("auth.loginFailed"),
        i18n.t("auth.incorrectCredentials")
      );
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Clear local session data and token
      await clearAllData();
      await clearFirebaseAuthToken();
      console.log("Logout successful, local data cleared");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Context Provider: Chia sẻ trạng thái auth cho toàn app
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
