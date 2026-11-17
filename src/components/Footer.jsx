import { Link } from "react-router-dom"
import { useLang } from "../context/LanguageContext"

export default function Footer() {
    const { t } = useLang()

    return (
        <footer className="site-footer">
            <img className="footer-logo" src="/logo.png" alt="Yummy Go" />

            <nav className="footer-links">
                <Link to="/">{t("nav.home")}</Link>
                <Link to="/stalls">{t("nav.stalls")}</Link>
                <Link to="/favorites">{t("fav.title")}</Link>
            </nav>

            <p className="footer-tag">{t("footer.tagline")}</p>
            <p className="footer-copy">{t("footer.copy")}</p>
        </footer>
    )
}