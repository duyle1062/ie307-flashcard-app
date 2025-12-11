import { useState } from "react";
import { TouchableOpacity, StyleSheet, View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";

import AntDesign from "@expo/vector-icons/AntDesign";

import { Colors } from "../const/Color";
import { Shadows } from "../const/Shadow";

import CreateCollectionSheet from "./CreateCollectionSheet";
import CreateCardSheet from "./CreateCardSheet";

const MENU_ITEMS = [
  {
    id: "create-collection",
    label: "Create Collection",
    icon: "form" as const,
    angle: 305,
    right: -20,
  },
  {
    id: "create-card",
    label: "Create Card",
    icon: "edit" as const,
    angle: 191,
    right: 35,
  },
  {
    id: "import",
    label: "Import Collection",
    icon: "upload" as const,
    angle: 151,
    right: -5,
  },
] as const;

const RADIUS = 85;

interface Props {
  onCreateCollection?: (name: string) => void;
  onCreateCard?: (data: any) => void;
  onImport?: () => void;
  collections?: Array<{ id: string; name: string }>;
}

const FloatingAddButton: React.FC<Props> = ({
  onCreateCollection,
  onCreateCard,
  onImport,
  collections = [],
}) => {
  const isOpen = useSharedValue(0);
  const [showCollectionSheet, setShowCollectionSheet] = useState(false);
  const [showCardSheet, setShowCardSheet] = useState(false);

  const closeAll = () => {
    isOpen.value = withTiming(0, { duration: 280 });
    setShowCollectionSheet(false);
    setShowCardSheet(false);
  };

  const overlayStyle = useAnimatedStyle(() => {
    const isActive = isOpen.value > 0 || showCollectionSheet || showCardSheet;
    return {
      opacity: interpolate(isActive ? 1 : 0, [0, 1], [0, 0.5]),
      pointerEvents: isActive ? "auto" : "none",
    };
  });

  const fabRotation = useAnimatedStyle(() => ({
    transform: [{ rotate: `${isOpen.value * 135}deg` }],
  }));

  return (
    <>
      <Animated.View
        style={[styles.overlay, overlayStyle]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          activeOpacity={1}
          style={StyleSheet.absoluteFill}
          onPress={closeAll}
        />
      </Animated.View>

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

      <View style={styles.container} pointerEvents="box-none">
        {MENU_ITEMS.map((item) => {
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
            const opacity = interpolate(
              isOpen.value,
              [0, 0.4],
              [0, 1],
              "clamp"
            );

            return {
              transform: [{ translateX }, { translateY }, { scale }],
              opacity,
            };
          });

          return (
            <Animated.View
              key={item.id}
              style={[styles.menuItemWrapper, animatedStyle]}
            >
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => {
                  if (item.id === "create-collection") {
                    isOpen.value = withTiming(0, { duration: 280 });
                    setTimeout(() => setShowCollectionSheet(true), 300);
                  } else if (item.id === "create-card") {
                    isOpen.value = withTiming(0, { duration: 280 });
                    setTimeout(() => setShowCardSheet(true), 300);
                  } else if (item.id === "import") {
                    onImport?.();
                    isOpen.value = withTiming(0, { duration: 280 });
                  }
                }}
                activeOpacity={0.8}
              >
                <View style={styles.iconCircle}>
                  <AntDesign
                    name={item.icon}
                    size={22}
                    color={Colors.primary}
                  />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        <TouchableOpacity
          style={styles.mainButton}
          onPress={() =>
            (isOpen.value = withTiming(isOpen.value === 1 ? 0 : 1, {
              duration: 320,
            }))
          }
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
    backgroundColor: `${Colors.primary}14`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },

  menuLabel: {
    fontSize: 15.5,
    color: Colors.title,
    fontWeight: "600",
  },
});

export default FloatingAddButton;
