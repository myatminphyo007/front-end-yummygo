import { useLang } from "../context/LanguageContext"

export default function StarRating({ value = 0, count = 0 }) {
    const { t } = useLang()
    const full = Math.round(value)

    return (
        <span>
            <span className="stars">
                {"★".repeat(full)}
                {"☆".repeat(5 - full)}
            </span>{" "}
            {count > 0 ? `${value.toFixed(1)} (${count})` : t("shop.noReviews")}
        </span>
    )
}