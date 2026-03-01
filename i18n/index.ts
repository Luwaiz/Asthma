import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './translations/en.json';
import es from './translations/es.json';
import fr from './translations/fr.json';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es },
};

const LANGUAGE_KEY = 'user-language';

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
  
  if (!savedLanguage) {
    try {
      // Detect system language
      const locales = Localization.getLocales();
      if (locales && locales.length > 0) {
        const deviceLanguage = locales[0].languageCode;
        savedLanguage = ['en', 'fr', 'es'].includes(deviceLanguage) ? deviceLanguage : 'en';
      } else {
        savedLanguage = 'en';
      }
    } catch (error) {
      console.warn('Localization failed, falling back to English:', error);
      savedLanguage = 'en';
    }
  }

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: savedLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
};

initI18n();

export default i18n;
