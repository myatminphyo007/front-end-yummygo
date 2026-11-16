import { useEffect, useRef, useState } from "react"
import useSeason from "../utils/useSeason"
import { ICON, seasonOf } from "../utils/season"
import { useLang } from "../context/LanguageContext"

const OPTIONS = ["auto", "spring", "summer", "autumn", "winter"]

export default function SeasonSwitcher() {
    const { choice, season, choose } = useSeason()
    const { t } = useLang()
    const [open, setOpen] = useState(false) // opened by a tap (phones)
    const [hide, setHide] = useState(false) // closes right after picking
    const ref = useRef(null)

    useEffect(() => {
        const onDown = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener("mousedown", onDown)
        return () => document.removeEventListener("mousedown", onDown)
    }, [])

    const pick = (value) => {
        choose(value)
        setOpen(false)
        setHide(true)
    }

    return (
        <div
            className={`season-menu ${open ? "open" : ""} ${hide ? "hide" : ""}`}
            ref={ref}
            onMouseLeave={() => setHide(false)}
        >
            <button
                className="season-btn"
                type="button"
                onClick={() => {
                    setHide(false)
                    setOpen(!open)
                }}
                aria-haspopup="menu"
                aria-expanded={open}
                title={t(`season.${choice}`)}
            >
                <span key={season} className="season-icon">{ICON[season]}</span>
                {choice === "auto" && <i>A</i>}
            </button>

            <div className="season-pop" role="menu">
                <div className="season-card">
                    {OPTIONS.map((v) => (
                        <div key={v}>
                            <button
                                type="button"
                                role="menuitem"
                                className={`season-opt ${choice === v ? "active" : ""}`}
                                onClick={() => pick(v)}
                            >
                                <span className="season-opt-icon">{v === "auto" ? "🗓️" : ICON[v]}</span>
                                <span>{t(`season.opt.${v}`)}</span>
                                {v === "auto" && <small>{ICON[seasonOf()]}</small>}
                                {choice === v && <b>✓</b>}
                            </button>
                            {v === "auto" && <div className="season-sep"></div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}