import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { Colors } from "../shared/constants/Color";
import { Shadows } from "../shared/constants/Shadow";

export type Collection = {
  id: string;
  title: string;
  new: number;
  learning: number;
  review: number;
};

interface CollectionListProps {
  data: Collection[];
  onPressItem: (item: Collection) => void;
  onLongPressItem: (item: Collection) => void;
}

const CollectionList: React.FC<CollectionListProps> = ({
  data,
  onPressItem,
  onLongPressItem,
}) => {
  const getStatusColor = (
    value: number,
    type: "new" | "learning" | "review"
  ) => {
    if (value === 0) return Colors.gray;
    if (type === "new") return Colors.blue;
    if (type === "learning") return Colors.red;
    if (type === "review") return Colors.green;
  };

  const renderItem = ({ item }: { item: Collection }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPressItem(item)}
      activeOpacity={0.7}
      onLongPress={() => onLongPressItem(item)}
      delayLongPress={500}
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
      <View style={styles.statusRow}>
        <Text
          style={[
            styles.statusText,
            { color: getStatusColor(item.new, "new") },
          ]}
        >
          {item.new}
        </Text>
        <Text
          style={[
            styles.statusText,
            { color: getStatusColor(item.learning, "learning") },
          ]}
        >
          {item.learning}
        </Text>
        <Text
          style={[
            styles.statusText,
            { color: getStatusColor(item.review, "review") },
          ]}
        >
          {item.review}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingBottom: 120,
        paddingHorizontal: 20,
        paddingTop: 10,
      }}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 20,
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...Shadows.medium,
  },

  cardTitle: {
    color: Colors.title,
    fontSize: 15,
    fontWeight: "500",
  },

  statusRow: {
    flexDirection: "row",
    gap: 6,
  },

  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default CollectionList;
