import useFavorites from "../utils/useFavorites"
import { useLang } from "../context/LanguageContext"
import Icon from "./Icon"

export default function FavButton({ id }) {
    const { has, toggle } = useFavorites()
    const { t } = useLang()
    const on = has(id)

    return (
        <button
            type="button"
            className={`fav-btn ${on ? "on" : ""}`}
            title={on ? t("fav.remove") : t("fav.add")}
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggle(id)
            }}
        >
            <Icon name="heart" size={18} />
        </button>
    )
}