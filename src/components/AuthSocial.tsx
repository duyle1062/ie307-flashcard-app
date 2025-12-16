import { View, TouchableOpacity, StyleSheet } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Colors } from "../shared/constants/Color";

export default function AuthSocial() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconBtn}>
        <FontAwesome5 name="facebook" size={30} color="black" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconBtn}>
        <FontAwesome5 name="google" size={30} color="black" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.iconBtn}>
        <FontAwesome5 name="apple" size={30} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    gap: 20,
  },

  iconBtn: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 10,
    padding: 10,
  },
});
