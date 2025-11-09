import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { initDatabase } from "./src/database";

export default function App(): React.ReactElement {
  const [isDbReady, setIsDbReady] = useState<boolean>(false);
  const [dbError, setDbError] = useState<Error | null>(null);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async (): Promise<void> => {
    try {
      console.log("Initializing database...");
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
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>Flashcard App</Text>
      <Text style={styles.subtitle}>Database Initialized Successfully!</Text>
      {dbError && <Text style={styles.error}>Warning: {dbError.message}</Text>}
    </View>
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
    justifyContent: "center",
    alignItems: "center",
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
