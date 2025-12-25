import { View, TextInput, StyleSheet } from "react-native";

import Feather from "@expo/vector-icons/Feather";

import { Colors } from "../shared/constants/Color";
import { Shadows } from "../shared/constants/Shadow";

import { useTranslation } from "react-i18next";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.searchBar}>
      <Feather name="search" size={18} color={Colors.gray} />
      <TextInput
        style={styles.searchInput}
        placeholder={t("common.search")}
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
