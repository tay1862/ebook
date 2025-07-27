import React, { createContext, useContext, useState, ReactNode } from 'react'

type Language = 'en' | 'lo'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (en: string, lo: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en')

  const t = (en: string, lo: string) => {
    return language === 'lo' ? lo : en
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}