import { createContext, useContext, ReactNode } from "react";
import { useSync as useSyncHook } from "../../features/sync/hooks";

type SyncContextType = ReturnType<typeof useSyncHook>;

const SyncContext = createContext<SyncContextType | null>(null);

/**
 * SyncProvider - Global sync context
 * ✅ FIX: Moved useSync to App-level to prevent duplicate listeners
 * Previously: useSync was called in Home.tsx, causing duplicate listeners when component re-mounted
 * Now: Single instance of useSync at app root level
 */
export const SyncProvider = ({ children }: { children: ReactNode }) => {
  const syncMethods = useSyncHook();

  return (
    <SyncContext.Provider value={syncMethods}>{children}</SyncContext.Provider>
  );
};

/**
 * useSync hook - Access sync methods from context
 */
export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSync must be used within SyncProvider");
  }
  return context;
};
