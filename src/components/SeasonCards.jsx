import useSeason from "../utils/useSeason"
import { useLang } from "../context/LanguageContext"

const ORDER = ["spring", "summer", "autumn", "winter"]

export default function SeasonCards() {
    const { season, choose } = useSeason()
    const { t } = useLang()

    return (
        <section className="seasons">
            <div className="seasons-head">
                <h2>{t("sc.title")}</h2>
                <p>{t("sc.hint")}</p>
            </div>

            <div className="seasons-row">
                {ORDER.map((s) => (
                    <button
                        key={s}
                        type="button"
                        className={`sc-card ${season === s ? "active" : ""}`}
                        onClick={() => choose(s)}
                        aria-pressed={season === s}
                    >
                        <img src={`/mascots/${s}.webp`} alt={t(`season.opt.${s}`)} loading="lazy" />
                        {season === s && <span className="sc-now">● {t("sc.now")}</span>}
                        <div className="sc-cap">
                            <b>{t(`season.opt.${s}`)}</b>
                            <small>{t(`sc.${s}`)}</small>
                        </div>
                    </button>
                ))}
            </div>
        </section>
    )
}