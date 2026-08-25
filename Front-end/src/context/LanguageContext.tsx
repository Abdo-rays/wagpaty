import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { ar } from '../i18n/ar'
import { en } from '../i18n/en'
import type { TranslationKey } from '../i18n/ar'

type Lang = 'ar' | 'en'

interface LangContextType {
  lang: Lang
  toggleLang: () => void
  t: (key: TranslationKey) => string
  isRtl: boolean
}

const LangContext = createContext<LangContextType | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() =>
    (localStorage.getItem('lang') as Lang) || 'ar'
  )

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang)
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
    localStorage.setItem('lang', lang)
  }, [lang])

  const toggleLang = () => setLang(l => (l === 'ar' ? 'en' : 'ar'))

  const t = (key: TranslationKey): string =>
    lang === 'ar' ? ar[key] : en[key]

  return (
    <LangContext.Provider value={{ lang, toggleLang, t, isRtl: lang === 'ar' }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
