import React, { useState } from "react";
import { TouchableOpacity, Image } from "react-native";
import i18n from "./i18n";

const flags = {
  fr: require("./../../assets/fr.png"),
  en: require("./../../assets/en.png"),
  zh: require("./../../assets/zh.png"),
  es: require("./../../assets/es.png"),
  de: require("./../../assets/de.png"),
  ko: require("./../../assets/ko.png"),
  th: require("./../../assets/th.jpg"),
};

const languages = ["fr", "en", "zh", "es", "de", "ko", "th"];

export default function LanguageSwitcher() {
  const [lang, setLang] = useState(i18n.language || "en");

  const switchLanguage = () => {
    const currentIndex = languages.indexOf(lang);
    const nextLang = languages[(currentIndex + 1) % languages.length];
    i18n.changeLanguage(nextLang);
    setLang(nextLang);
  };

  return (
    <TouchableOpacity testID='languageSwitcher' onPress={switchLanguage}>
      <Image
        source={flags[lang]}
        style={{
          width: 40,
          height: 30,
          borderRadius: 5,
          marginTop: -35,
          marginBottom: 10,
        }}
      />
    </TouchableOpacity>
  );
}
