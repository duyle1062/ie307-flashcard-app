import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../shared/constants/Color";
import { useLanguage } from "../shared/hooks/useLanguage";

export default function Setting() {
  const { language, changeLanguage, t } = useLanguage();

  const handleLanguageChange = (lang: "en" | "vi") => {
    changeLanguage(lang);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Language Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>{t("settings.language")}</Text>

        <View style={styles.languageContainer}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              language === "en" && styles.languageButtonActive,
            ]}
            onPress={() => handleLanguageChange("en")}
          >
            <MaterialIcons
              name={language === "en" ? "check-circle" : "circle"}
              size={24}
              color={Colors.primary}
            />
            <Text
              style={[
                styles.languageText,
                language === "en" && styles.languageTextActive,
              ]}
            >
              {t("settings.english")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.languageButton,
              language === "vi" && styles.languageButtonActive,
            ]}
            onPress={() => handleLanguageChange("vi")}
          >
            <MaterialIcons
              name={language === "vi" ? "check-circle" : "circle"}
              size={24}
              color={Colors.primary}
            />
            <Text
              style={[
                styles.languageText,
                language === "vi" && styles.languageTextActive,
              ]}
            >
              {t("settings.vietnamese")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.title,
    marginBottom: 12,
  },

  languageContainer: {
    gap: 12,
  },

  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  languageButtonActive: {
    backgroundColor: Colors.primary + "15",
    borderColor: Colors.primary,
  },

  languageText: {
    fontSize: 16,
    color: Colors.subText,
    marginLeft: 12,
    flex: 1,
  },

  languageTextActive: {
    fontWeight: "bold",
    color: Colors.primary,
  },
});
