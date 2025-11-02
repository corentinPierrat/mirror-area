import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import fr from "./../../locales/fr.json";
import en from "./../../locales/en.json";
import zh from "./../../locales/zh.json";
import es from "./../../locales/es.json";
import de from "./../../locales/de.json";
import ko from "./../../locales/ko.json";
import th from "./../../locales/th.json";

const deviceLanguage = Localization.getLocales()[0]?.languageCode;

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v3",
    lng: deviceLanguage,
    fallbackLng: "en",
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      zh: { translation: zh },
      es: { translation: es },
      de: { translation: de },
      ko: { translation: ko },
      th: { translation: th },
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
