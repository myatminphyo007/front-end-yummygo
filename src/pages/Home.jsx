import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../api/axios"
import { useLang } from "../context/LanguageContext"
import { dateOnly } from "../utils/festivalDates"
import { RING } from "../utils/season"
import useSeason from "../utils/useSeason"
import SkeletonGrid from "../components/Skeleton"
import SeasonFX from "../components/SeasonFX"

export default function Home() {
    const navigate = useNavigate()
    const { t } = useLang()
    const { season } = useSeason()
    const [search, setSearch] = useState("")
    const [festivals, setFestivals] = useState([])
    const [counts, setCounts] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([api.get("/festivals"), api.get("/shops")])
            .then(([f, s]) => {
                // count stalls per festival
                const c = {}
                s.data.forEach((shop) => {
                    const id = shop.festival?._id || shop.festival
                    if (id) c[id] = (c[id] || 0) + 1
                })
                setCounts(c)

                // running festivals first, ended ones last
                const today = new Date().toLocaleDateString("sv-SE")
                const list = [...f.data].sort((a, b) => {
                    const ea = dateOnly(a.endDate) < today
                    const eb = dateOnly(b.endDate) < today
                    if (ea !== eb) return ea ? 1 : -1
                    return dateOnly(a.startDate).localeCompare(dateOnly(b.startDate))
                })
                setFestivals(list)
            })
            .finally(() => setLoading(false))
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        navigate(`/stalls?search=${encodeURIComponent(search)}`)
    }

    const today = new Date().toLocaleDateString("sv-SE")

    return (
        <>
            <section className="hero">
                <SeasonFX season={season} />

                <div className="hero-content">
                    <span className="eyebrow">{t("home.eyebrow")}</span>
                    <h1>{t("home.title")}</h1>
                    <p>{t("home.subtitle")}</p>

                    <form className="hero-search" onSubmit={handleSearch}>
                        <input
                            placeholder={t("home.searchPlaceholder")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button className="btn" type="submit">{t("home.search")}</button>
                    </form>
                </div>

                {/* 3D animation */}
                <div className="hero-3d" aria-hidden="true">
                    <div className="hero-ball"></div>
                    <div className="hero-ring">
                        {RING[season].map((e, i) => (
                            <div className="ring-item" key={season + i} style={{ "--a": `${i * 60}deg` }}>
                                <span>{e}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="container">
                <div className="features">
                    <div className="feature">
                        <div className="emoji">🍢</div>
                        <h3>{t("home.f1Title")}</h3>
                        <p>{t("home.f1Text")}</p>
                    </div>
                    <div className="feature">
                        <div className="emoji">⏰</div>
                        <h3>{t("home.f2Title")}</h3>
                        <p>{t("home.f2Text")}</p>
                    </div>
                    <div className="feature">
                        <div className="emoji">✅</div>
                        <h3>{t("home.f3Title")}</h3>
                        <p>{t("home.f3Text")}</p>
                    </div>
                    <div className="feature">
                        <div className="emoji">⭐</div>
                        <h3>{t("home.f4Title")}</h3>
                        <p>{t("home.f4Text")}</p>
                    </div>
                </div>

                <div className="section-title" style={{ marginTop: 40 }}>
                    <h2>{t("home.festivals")}</h2>
                    <Link className="btn outline small" to="/stalls">{t("home.seeAll")}</Link>
                </div>

                {loading ? (
                    <SkeletonGrid />
                ) : festivals.length === 0 ? (
                    <div className="empty">{t("home.noFestivals")}</div>
                ) : (
                    <div className="grid">
                        {festivals.map((f) => {
                            const ended = dateOnly(f.endDate) < today
                            return (
                                <Link
                                    key={f._id}
                                    to={`/festival/${f._id}`}
                                    className={`festival-card ${ended ? "ended" : ""}`}
                                >
                                    <div className="festival-cover">
                                        {f.image ? <img src={f.image} alt={f.name} /> : <span>🎪</span>}
                                        {ended && <em className="festival-ended">{t("shop.festivalEnded")}</em>}
                                    </div>
                                    <div className="festival-body">
                                        <h3>{f.name}</h3>
                                        <p className="muted">📍 {f.place}</p>
                                        <p className="muted">
                                            📅 {dateOnly(f.startDate)} - {dateOnly(f.endDate)}
                                        </p>
                                        <p className="festival-count">
                                            🍢 {counts[f._id] || 0} {t("festival.stalls")}
                                        </p>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </>
    )
}