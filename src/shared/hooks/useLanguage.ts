import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useLanguage = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = async (lang: "en" | "vi") => {
    try {
      await i18n.changeLanguage(lang);
      await AsyncStorage.setItem("language", lang);
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

  const initializeLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("language");
      if (savedLanguage) {
        await i18n.changeLanguage(savedLanguage);
      }
    } catch (error) {
      console.error("Error initializing language:", error);
    }
  };

  return {
    language: i18n.language as "en" | "vi",
    changeLanguage,
    t,
    i18n,
    initializeLanguage,
  };
};
