import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Colors } from "../shared/constants/Color";
import { Shadows } from "../shared/constants/Shadow";

interface FlashCardProps {
  front: string;
  back: string;
  isFlipped: boolean;
}

export default function FlashCard({ front, back, isFlipped }: FlashCardProps) {
  return (
    <View style={styles.cardWrapper}>
      <ScrollView
        contentContainerStyle={styles.cardScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.textFront}>{front}</Text>
        {isFlipped && (
          <View style={styles.backContent}>
            <View style={styles.divider} />
            <Text style={styles.textBack}>{back}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: "100%",
    height: "100%",
    maxHeight: 600,
    backgroundColor: Colors.white,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.gold,
    ...Shadows.medium,
    overflow: "hidden",
  },

  cardScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  textFront: {
    fontSize: 42,
    color: Colors.title,
    textAlign: "center",
    fontWeight: "400",
  },

  backContent: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },

  divider: {
    height: 1,
    width: "100%",
    backgroundColor: Colors.gray,
    marginVertical: 20,
  },

  textBack: {
    fontSize: 28,
    color: Colors.title,
    textAlign: "center",
    lineHeight: 40,
  },
});
