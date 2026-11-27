import { useNavigate } from "react-router-dom"
import { useLang } from "../context/LanguageContext"

// goes back one page; if there is no page to go back to, goes to `fallback`
export default function BackButton({ fallback = "/stalls" }) {
    const navigate = useNavigate()
    const { t } = useLang()

    const goBack = () => {
        if (window.history.length > 1) navigate(-1)
        else navigate(fallback)
    }

    return (
        <button type="button" className="btn outline small" onClick={goBack}>
            ← {t("common.back")}
        </button>
    )
}
