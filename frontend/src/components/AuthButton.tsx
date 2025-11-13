import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Colors } from "../const/Color";

export default function AuthButton({
  title,
  onPress,
}: {
  title: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress}>
      <Text style={styles.btnText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: "100%",
    backgroundColor: Colors.black,
    borderRadius: 10,
    paddingVertical: 10,
    marginVertical: 15,
    alignItems: "center",
  },

  btnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});
