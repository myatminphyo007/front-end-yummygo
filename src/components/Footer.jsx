import { useLang } from "../context/LanguageContext"

export default function Footer() {
    const { t } = useLang()

    return (
        <footer>
            <h2>🍡 Yummy Go</h2>
            <p>{t("footer.tagline")}</p>
            <p>{t("footer.copy")}</p>
        </footer>
    )
}