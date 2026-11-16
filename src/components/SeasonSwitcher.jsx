import useSeason from "../utils/useSeason"
import { ICON } from "../utils/season"
import { useLang } from "../context/LanguageContext"

export default function SeasonSwitcher() {
    const { choice, season, cycle } = useSeason()
    const { t } = useLang()
    const label = t(`season.${choice}`)

    return (
        <button className="season-btn" type="button" onClick={cycle} title={label} aria-label={label}>
            <span key={season} className="season-icon">{ICON[season]}</span>
            {choice === "auto" && <i>A</i>}
        </button>
    )
}