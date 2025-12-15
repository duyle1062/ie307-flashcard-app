import { useState } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";

const RADIUS = 85;

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  angle: number;
  right: number;
}

export const useFloatingMenu = (menuItems: readonly MenuItem[]) => {
  const isOpen = useSharedValue(0);
  const [showCollectionSheet, setShowCollectionSheet] = useState(false);
  const [showCardSheet, setShowCardSheet] = useState(false);

  const closeAll = () => {
    isOpen.value = withTiming(0, { duration: 280 });
    setShowCollectionSheet(false);
    setShowCardSheet(false);
  };

  const toggleMenu = () => {
    isOpen.value = withTiming(isOpen.value === 1 ? 0 : 1, { duration: 320 });
  };

  const handleMenuItemPress = (itemId: string) => {
    if (itemId === "create-collection") {
      setShowCollectionSheet(true);
    } else if (itemId === "create-card") {
      setShowCardSheet(true);
    }
    isOpen.value = withTiming(0, { duration: 280 });
  };

  // Overlay animation
  const overlayStyle = useAnimatedStyle(() => {
    const isActive = isOpen.value > 0 || showCollectionSheet || showCardSheet;
    return {
      opacity: interpolate(isActive ? 1 : 0, [0, 1], [0, 0.5]),
      pointerEvents: isActive ? ("auto" as const) : ("none" as const),
    };
  });

  // FAB rotation animation
  const fabRotation = useAnimatedStyle(() => ({
    transform: [{ rotate: `${isOpen.value * 135}deg` }],
  }));

  // Create menu item styles - moved outside to follow hooks rules
  const createMenuItemStyle = (angle: number) => {
    const angleRad = (angle * Math.PI) / 180;
    return {
      angleRad,
      radius: RADIUS,
    };
  };

  return {
    // State
    isOpen,
    showCollectionSheet,
    showCardSheet,

    // Actions
    closeAll,
    toggleMenu,
    handleMenuItemPress,
    setShowCollectionSheet,
    setShowCardSheet,

    // Animated Styles
    overlayStyle,
    fabRotation,
    createMenuItemStyle,
  };
};
