import { createContext, useContext, useEffect, useState } from "react"
import translations from "../i18n/translations"

const LanguageContext = createContext(null)

export const LANGUAGES = [
    { code: "en", label: "English" },
    { code: "ja", label: "日本語" },
    { code: "my", label: "မြန်မာ" },
    { code: "ko", label: "한국어" },
]

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => {
        const saved = localStorage.getItem("lang")
        return saved && translations[saved] ? saved : "en"
    })

    useEffect(() => {
        localStorage.setItem("lang", lang)
        document.documentElement.lang = lang
    }, [lang])

    // t("auth.welcome", { name: "Aye" }) replaces {name}
    // if a word is missing in one language, it falls back to English
    const t = (key, vars = {}) => {
        let text = translations[lang][key] ?? translations.en[key] ?? key
        Object.entries(vars).forEach(([name, value]) => {
            text = text.replace(`{${name}}`, value)
        })
        return text
    }

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLang = () => useContext(LanguageContext)