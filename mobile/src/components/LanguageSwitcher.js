import React, { useState } from "react";
import { TouchableOpacity, Image } from "react-native";
import i18n from "./i18n";

export default function LanguageSwitcher() {
  const [lang, setLang] = useState(i18n.language);

  const toggleLanguage = () => {
    const newLang = lang === "fr" ? "en" : "fr";
    i18n.changeLanguage(newLang);
    setLang(newLang);
  };

  return (
    <TouchableOpacity onPress={toggleLanguage}>
      <Image
        source={
          lang === "fr"
            ? require("./../../assets/fr.png")
            : require("./../../assets/en.png")
        }
        style={{ width: 40, height: 30, borderRadius: 5, marginTop: -35, marginBottom: 10 }}
      />
    </TouchableOpacity>
  );
}
