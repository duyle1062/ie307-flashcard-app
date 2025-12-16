import { View, TextInput, StyleSheet } from "react-native";

import Feather from "@expo/vector-icons/Feather";

import { Colors } from "../const/Color";
import { Shadows } from "../const/Shadow";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText }) => {
  return (
    <View style={styles.searchBar}>
      <Feather name="search" size={18} color={Colors.gray} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search"
        placeholderTextColor={Colors.gray}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginTop: 20,
    marginHorizontal: 20,
    ...Shadows.medium,
  },

  searchInput: {
    flex: 1,
    marginLeft: 6,
    color: Colors.black,
  },
});

export default SearchBar;
