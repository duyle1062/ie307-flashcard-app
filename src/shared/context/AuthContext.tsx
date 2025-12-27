import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Alert } from "react-native";

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
  clearAllData,
  clearFirebaseAuthToken,
} from "../../core/database/storage";
import { logTableData } from "../../core/utils/dbDebug";
import { getDatabase } from "../../core/database";
import { User } from "../../core/database/types";
import { clearLocalDatabase } from "../../core/database/helpers";

import { syncService } from "../../features/sync/services/syncService";

type AuthContextType = {
  user: FirebaseUser | null;
  userData: User | null; // User của App (SQLite - chứa streak, settings)
  isAuthenticated: boolean;
  isLoading: boolean;
  register: (email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isSyncedRef = useRef<boolean>(false);

  /**
   * Helper: Đồng bộ User từ Firestore về SQLite
   * Được tách ra để dùng chung
   */
  const syncCloudUserToLocal = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const cloudData = userDoc.data();

        // Map data từ Firestore sang cấu trúc Local
        // Sử dụng Partial để an toàn kiểu dữ liệu
        const userToSave: Partial<User> & { id: string } = {
          id: uid,
          email: cloudData.email || "",
          display_name: cloudData.display_name || cloudData.name || "",
          picture: cloudData.picture || cloudData.profile_picture_url,
          streak_days: cloudData.streak_days ?? 0,
          last_active_date: cloudData.last_active_date,
          daily_new_cards_limit: cloudData.daily_new_cards_limit ?? 25,
          daily_review_cards_limit: cloudData.daily_review_cards_limit ?? 50,
        };

        const savedUser = await upsertUser(userToSave);

        // Cập nhật state ngay lập tức nếu có sự thay đổi
        if (savedUser) {
          setUserData(savedUser);
        }
        console.log("User synced from Cloud to SQLite:", uid);
      }
    } catch (error) {
      console.error("Error internal syncing user:", error);
    }
  };

  // Hàm load user data từ SQLite lên State
  const refreshUser = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const localUser = await getUserById(user.uid);
      if (localUser) {
        setUserData(localUser);
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  }, [user?.uid]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // 1. QUAN TRỌNG: Lưu Session ID trước (Chặn await để đảm bảo xong 100%)
          await saveCurrentUserId(currentUser.uid);

          // 2. Load User từ SQLite lên
          const localUser = await getUserById(currentUser.uid);
          if (localUser) {
            setUserData(localUser);
          }

          // 3. Sync Cloud (Chạy background, không cần await block UI lâu)
          if (!isSyncedRef.current) {
            syncCloudUserToLocal(currentUser.uid).then(() => {
              isSyncedRef.current = true;
            });
          }

          // 4. SAU KHI MỌI THỨ SẴN SÀNG -> MỚI CHO PHÉP LOGIN
          setUser(currentUser);
        } catch (error) {
          console.error("Auth init error:", error);
        }
      } else {
        // Logout logic
        setUserData(null);
        isSyncedRef.current = false;
        setUser(null);
      }

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

      // DEBUG: Log dữ liệu users sau khi register
      const sqliteDb = await getDatabase();
      await logTableData(sqliteDb, "users");

      // Update State ngay lập tức
      setUserData(fullUserData);
      isSyncedRef.current = true; // Đánh dấu là data đã mới nhất, không cần sync lại ở useEffect

      // User tự động login và navigate vào app
      return true;
    } catch (error: any) {
      let msg = "Registration failed";
      if (error.code === "auth/email-already-in-use")
        msg = "Email already in use.";
      if (error.code === "auth/weak-password") msg = "Password is too weak.";
      Alert.alert("Error", msg);
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

      await syncCloudUserToLocal(firebaseUser.uid);
      await saveCurrentUserId(firebaseUser.uid);
      isSyncedRef.current = true;

      const sqliteDb = await getDatabase();
      await logTableData(sqliteDb, "users");

      return true;
    } catch (error: any) {
      Alert.alert("Login Failed", "Incorrect email or password");
      return false;
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // 1. Cố gắng PUSH thay đổi lên Cloud trước khi xóa (Best Effort)
      // Chỉ PUSH, không Pull (tiết kiệm thời gian)
      // Nếu đang không có mạng hoặc lỗi, bước này sẽ fail nhanh chóng
      try {
        console.log("Attempting final push before logout...");
        await syncService.sync(user?.uid || "", { push: true, pull: false });
        console.log("Final push complete.");
      } catch (syncError) {
        console.warn(
          "Final push failed (Network issue?), proceeding to logout anyway.",
          syncError
        );
      }

      setUser(null);
      setUserData(null);

      await signOut(auth);
      await clearAllData();
      await clearFirebaseAuthToken();
      await clearLocalDatabase();

      console.log("Logout successful & clean.");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert(
        "Logout Error",
        "Something went wrong, but local session is cleared"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        isAuthenticated: !!user,
        isLoading,
        register,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
