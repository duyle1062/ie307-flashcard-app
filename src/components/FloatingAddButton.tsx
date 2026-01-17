import { useState } from "react";
import { TouchableOpacity, StyleSheet, View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";

import AntDesign from "@expo/vector-icons/AntDesign";

import { Colors } from "../shared/constants/Color";
import { Shadows } from "../shared/constants/Shadow";

import CreateCollectionSheet from "./CreateCollectionSheet";
import CreateCardSheet from "./CreateCardSheet";
import ImportActionModal from "./ImportActionModal";

interface MenuItemProps {
  item: {
    id: string;
    label: string;
    icon: "form" | "edit" | "download" | "upload";
    angle: number;
    right: number;
  };
  isOpen: import("react-native-reanimated").SharedValue<number>;
  onPress: (itemId: string) => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, isOpen, onPress }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const angleRad = (item.angle * Math.PI) / 180;
    const translateX = interpolate(
      isOpen.value,
      [0, 1],
      [0, RADIUS * Math.cos(angleRad) + item.right]
    );
    const translateY = interpolate(
      isOpen.value,
      [0, 1],
      [0, RADIUS * Math.sin(angleRad)]
    );
    const scale = interpolate(isOpen.value, [0, 1], [0.6, 1], "clamp");
    const opacity = interpolate(isOpen.value, [0, 0.4], [0, 1], "clamp");

    return {
      transform: [{ translateX }, { translateY }, { scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.menuItemWrapper, animatedStyle]}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => onPress(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.iconCircle}>
          <AntDesign name={item.icon} size={22} color={Colors.primary} />
        </View>
        <Text style={styles.menuLabel}>{item.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const RADIUS = 85;

interface Props {
  onCreateCollection?: (name: string) => void;
  onCreateCard?: (data: any) => void;
  onImport?: (type: "csv" | "json") => void;
  collections?: Array<{ id: string; name: string }>;
}

const FloatingAddButton: React.FC<Props> = ({
  onCreateCollection,
  onCreateCard,
  onImport,
  collections = [],
}) => {
  const { t } = useTranslation();
  const isOpen = useSharedValue(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCollectionSheet, setShowCollectionSheet] = useState(false);
  const [showCardSheet, setShowCardSheet] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const MENU_ITEMS = [
    {
      id: "create-collection",
      label: t("components.createCollection"),
      icon: "form" as const,
      angle: 305,
      right: -20,
    },
    {
      id: "create-card",
      label: t("components.createCard"),
      icon: "edit" as const,
      angle: 191,
      right: 35,
    },
    {
      id: "import",
      label: t("components.importCollection"),
      icon: "upload" as const,
      angle: 151,
      right: -5,
    },
  ] as const;

  const closeAll = () => {
    isOpen.value = withTiming(0, { duration: 280 });
    setMenuOpen(false);
    setShowCollectionSheet(false);
    setShowCardSheet(false);
    setShowImportModal(false);
  };

  const shouldShowOverlay = () =>
    menuOpen || showCollectionSheet || showCardSheet || showImportModal;

  const overlayOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(isOpen.value, [0, 1], [0, 0.5]),
  }));

  const fabRotation = useAnimatedStyle(() => ({
    transform: [{ rotate: `${isOpen.value * 135}deg` }],
  }));

  return (
    <>
      {shouldShowOverlay() && (
        <Animated.View
          style={[styles.overlay, menuOpen ? overlayOpacity : { opacity: 0.5 }]}
          pointerEvents={
            menuOpen || showCollectionSheet || showCardSheet ? "auto" : "none"
          }
        >
          <TouchableOpacity
            activeOpacity={1}
            style={StyleSheet.absoluteFill}
            onPress={closeAll}
          />
        </Animated.View>
      )}

      <CreateCollectionSheet
        visible={showCollectionSheet}
        onClose={closeAll}
        onCreate={(name) => {
          onCreateCollection?.(name);
          closeAll();
        }}
      />

      <CreateCardSheet
        visible={showCardSheet}
        onClose={closeAll}
        onCreate={(data) => {
          onCreateCard?.(data);
          closeAll();
        }}
        collections={collections}
      />

      <ImportActionModal
        visible={showImportModal}
        onClose={closeAll}
        onImportCSV={() => {
          onImport?.("csv");
          closeAll();
        }}
        onImportJSON={() => {
          onImport?.("json");
          closeAll();
        }}
      />

      <View style={styles.container} pointerEvents="box-none">
        {MENU_ITEMS.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            isOpen={isOpen}
            onPress={(itemId) => {
              if (itemId === "create-collection") {
                isOpen.value = withTiming(0, { duration: 280 });
                setMenuOpen(false);
                setTimeout(() => setShowCollectionSheet(true), 300);
              } else if (itemId === "create-card") {
                isOpen.value = withTiming(0, { duration: 280 });
                setMenuOpen(false);
                setTimeout(() => setShowCardSheet(true), 300);
              } else if (itemId === "import") {
                isOpen.value = withTiming(0, { duration: 280 });
                setMenuOpen(false);
                setTimeout(() => setShowImportModal(true), 300);
              }
            }}
          />
        ))}

        <TouchableOpacity
          style={styles.mainButton}
          accessibilityRole="button"
          accessibilityLabel={t("common.add")}
          onPress={() => {
            const next = isOpen.value === 1 ? 0 : 1;
            setMenuOpen(next === 1);
            isOpen.value = withTiming(next, { duration: 320 });
          }}
          activeOpacity={0.85}
        >
          <Animated.View style={fabRotation}>
            <AntDesign name="plus" size={32} color={Colors.white} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.black,
    zIndex: 999,
  },

  container: {
    position: "absolute",
    bottom: 50,
    right: 20,
    zIndex: 1000,
  },

  mainButton: {
    width: 65,
    height: 65,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    ...Shadows.strong,
    elevation: 12,
  },

  menuItemWrapper: {
    position: "absolute",
    bottom: 32,
    right: 32,
  },

  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 30,
    minWidth: 160,
    ...Shadows.medium,
  },

  iconCircle: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: Colors.primary + "14",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },

  menuLabel: {
    fontSize: 15,
    color: Colors.title,
    fontWeight: "bold",
  },
});

export default FloatingAddButton;
