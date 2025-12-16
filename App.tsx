import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { initDatabase, resetDatabase } from "./src/core/database";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/shared/context/AuthContext";
import { SyncProvider } from "./src/shared/context/SyncContext";
import RootNavigator from "./src/navigation/RootNavigator";

// Disable Reanimated strict mode warnings
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Disable strict mode warnings
});

export default function App(): React.ReactElement {
  const [isDbReady, setIsDbReady] = useState<boolean>(false);
  const [dbError, setDbError] = useState<Error | null>(null);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async (): Promise<void> => {
    try {
      console.log("Initializing database...");

      // 🔥 UNCOMMENT dòng này để clear toàn bộ DB (chỉ dùng 1 lần)
      // await resetDatabase();

      await initDatabase();
      console.log("Database initialized successfully");
      setIsDbReady(true);
    } catch (error) {
      console.error("Failed to initialize database:", error);
      setDbError(error as Error);
      // Still set as ready to prevent blocking the app
      // User will see connection error later when trying to use offline features
      setIsDbReady(true);
    }
  };

  // Show loading screen while database is initializing
  if (!isDbReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SyncProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <RootNavigator />
          </NavigationContainer>
        </SyncProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4A90E2",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 18,
    color: "#2E7D32",
    marginBottom: 20,
  },

  error: {
    fontSize: 14,
    color: "#D32F2F",
    textAlign: "center",
  },
});
