import { useState, useCallback } from "react";

interface Collection {
  id: string;
  name: string;
}

interface CardFormData {
  collectionId: string;
  front: string;
  back: string;
}

export const useCardForm = (collections: Collection[]) => {
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const canCreate = !!(selectedCollection && frontText.trim() && backText.trim());

  const reset = useCallback(() => {
    setSelectedCollection(null);
    setFrontText("");
    setBackText("");
    setShowDropdown(false);
  }, []);

  const getFormData = useCallback((): CardFormData | null => {
    if (!canCreate || !selectedCollection) return null;
    
    return {
      collectionId: selectedCollection.id,
      front: frontText.trim(),
      back: backText.trim(),
    };
  }, [canCreate, selectedCollection, frontText, backText]);

  const selectCollection = useCallback((collection: Collection) => {
    setSelectedCollection(collection);
    setShowDropdown(false);
  }, []);

  const toggleDropdown = useCallback(() => {
    setShowDropdown(prev => !prev);
  }, []);

  return {
    // State
    selectedCollection,
    frontText,
    backText,
    showDropdown,
    canCreate,

    // Actions
    setFrontText,
    setBackText,
    selectCollection,
    toggleDropdown,
    reset,
    getFormData,
  };
};
