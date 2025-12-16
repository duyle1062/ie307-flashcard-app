import { useState, useCallback } from "react";

export const useCollectionForm = () => {
  const [collectionName, setCollectionName] = useState("");

  const canCreate = collectionName.trim().length > 0;

  const reset = useCallback(() => {
    setCollectionName("");
  }, []);

  const getFormData = useCallback((): string | null => {
    if (!canCreate) return null;
    return collectionName.trim();
  }, [canCreate, collectionName]);

  return {
    // State
    collectionName,
    canCreate,

    // Actions
    setCollectionName,
    reset,
    getFormData,
  };
};
