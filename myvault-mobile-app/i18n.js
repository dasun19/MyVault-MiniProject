import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import si from './locales/si.json';

const LANGUAGE_KEY = '@app_language';

// Get saved language
const getStoredLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    return savedLanguage || 'en';
  } catch (error) {
    return 'en';
  }
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      en: { translation: en },
      si: { translation: si }
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Load saved language on init
getStoredLanguage().then(language => {
  i18n.changeLanguage(language);
});

export default i18n;