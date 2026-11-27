import { useLang } from "../context/LanguageContext"

// shows how busy a shop is: mascot + 3 bars + a word
// level: "quiet" | "normal" | "busy"
export default function CrowdMeter({ level = "quiet", inline = false }) {
    const { t } = useLang()
    const bars = level === "busy" ? 3 : level === "normal" ? 2 : 1

    return (
        <div className={`crowd-badge crowd-${level} ${inline ? "inline" : ""}`} title={t("crowd.title")}>
            <span className="crowd-face">
                <img src="/mascot.png" alt="" />
                {level === "busy" && (
                    <svg className="crowd-sweat" viewBox="0 0 10 14" aria-hidden="true">
                        <path d="M5 1 C5 1 1 6.5 1 9 a4 4 0 0 0 8 0 C9 6.5 5 1 5 1 Z" />
                    </svg>
                )}
            </span>
            <span className="crowd-bars" aria-hidden="true">
                {[1, 2, 3].map((n) => (
                    <i key={n} className={n <= bars ? "on" : ""} />
                ))}
            </span>
            <span className="crowd-text">{t(`crowd.${level}`)}</span>
        </div>
    )
}
