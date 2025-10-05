import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import fr from "./../../locales/fr.json";
import en from "./../../locales/en.json";

const deviceLanguage = Localization.getLocales()[0]?.languageCode; 

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v3",
    lng: deviceLanguage === "fr" ? "fr" : "en",
    fallbackLng: "en",
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    interpolation: { escapeValue: false },
  });

export default i18n;

