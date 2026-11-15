import { useLang, LANGUAGES } from "../context/LanguageContext"

export default function LanguageSwitcher() {
    const { lang, setLang } = useLang()

    return (
        <select
            className="lang-switch"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            aria-label="Language"
        >
            {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                    {l.label}
                </option>
            ))}
        </select>
    )
}