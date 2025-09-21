// frontend/src/context/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Import your translation files directly
import enTranslations from '../i18n/en.json';
import hiTranslations from '../i18n/hi.json';
import taTranslations from '../i18n/ta.json';

// Consolidate translations
const allTranslations = {
  en: enTranslations,
  hi: hiTranslations,
  ta: taTranslations,
};

const LanguageContext = createContext();

// --- THIS IS THE CRITICAL MISSING FUNCTION ---
// This is the custom hook that all your other components need to import.
// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  return useContext(LanguageContext);
};
// -----------------------------------------

// This is the provider component that wraps your app
export const LanguageProvider = ({ children }) => {
  // Initialize language from localStorage or default to 'en'
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  // State to hold the currently active translation set
  const [currentTranslations, setCurrentTranslations] = useState(allTranslations[language]);

  // Update translations whenever the language state changes
  useEffect(() => {
    setCurrentTranslations(allTranslations[language]);
    localStorage.setItem('language', language); // Save preference
  }, [language]);

  // 't' function for translating keys
  const t = (key) => currentTranslations[key] || key; // Fallback to key if not found

  // The value provided by the context
  const contextValue = {
    language,       // Current active language ('en', 'hi', 'ta')
    setLanguage,    // Function to change the language
    t               // Translation function
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};