import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import enTranslation from "./locales/en/translation.json";
import viTranslation from "./locales/vi/translation.json";

const deviceLanguage = Localization.getLocales()[0].languageCode || "en";

const resources = {
  en: { translation: enTranslation },
  vi: { translation: viTranslation },
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  lng: deviceLanguage === "vi" ? "vi" : "en",
  interpolation: {
    escapeValue: false,
  },
  ns: ["translation"],
  defaultNS: "translation",
});

export default i18n;
