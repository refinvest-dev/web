'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export const locales = ['en', 'ko'] as const

export type Locale = (typeof locales)[number]

const storageKey = 'refinvest.locale'

const browserLocales: Record<Locale, string> = {
  en: 'en-US',
  ko: 'ko-KR',
}

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en'

  const savedLocale = window.localStorage.getItem(storageKey)
  if (savedLocale === 'en' || savedLocale === 'ko') return savedLocale

  return navigator.language.toLowerCase().startsWith('ko') ? 'ko' : 'en'
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    setLocaleState(getInitialLocale())
  }, [])

  useEffect(() => {
    document.documentElement.lang = browserLocales[locale]
    window.localStorage.setItem(storageKey, locale)
  }, [locale])

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale)
  }, [])

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const context = useContext(LocaleContext)

  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }

  return context
}
