    import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import api from "../api/axios"
import { useLang } from "../context/LanguageContext"
import ShopCard from "../components/ShopCard"
import { dateOnly } from "../utils/festivalDates"

export default function FestivalPage() {
    const { id } = useParams()
    const { t } = useLang()
    const [festival, setFestival] = useState(null)
    const [shops, setShops] = useState([])
    const [category, setCategory] = useState("ALL")
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        setLoading(true)
        Promise.all([api.get(`/festivals/${id}`), api.get("/shops", { params: { festival: id } })])
            .then(([f, s]) => {
                setFestival(f.data)
                setShops(s.data)
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return <div className="container"><p>{t("stalls.loading")}</p></div>
    if (notFound || !festival)
        return (
            <div className="container">
                <div className="empty">{t("festival.notFound")}</div>
            </div>
        )

    const today = new Date().toLocaleDateString("sv-SE")
    const ended = dateOnly(festival.endDate) < today

    const categories = ["ALL", ...new Set(shops.map((s) => s.category).filter(Boolean))]
    const visible = shops.filter((s) => {
        const okCategory = category === "ALL" || s.category === category
        const text = `${s.name} ${s.category} ${s.description}`.toLowerCase()
        return okCategory && text.includes(search.toLowerCase())
    })

    return (
        <div className="container">
            <Link className="btn outline small" to="/">← {t("festival.back")}</Link>

            <div className="panel" style={{ marginTop: 16 }}>
                <h2 style={{ margin: 0 }}>
                    {festival.name} {ended && <span className="festival-ended-inline">{t("shop.festivalEnded")}</span>}
                </h2>
                <p className="muted">📍 {festival.place}</p>
                <p className="muted">
                    📅 {dateOnly(festival.startDate)} - {dateOnly(festival.endDate)}
                </p>
                {festival.description && <p>{festival.description}</p>}
            </div>

            <div className="section-title" style={{ marginTop: 30 }}>
                <h2>{t("stalls.title")} ({shops.length})</h2>
            </div>

            <div className="search-row">
                <input
                    placeholder={t("stalls.search")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="filters">
                {categories.map((c) => (
                    <button
                        key={c}
                        className={`chip ${category === c ? "active" : ""}`}
                        onClick={() => setCategory(c)}
                    >
                        {c === "ALL" ? t("stalls.all") : c}
                    </button>
                ))}
            </div>

            {visible.length === 0 ? (
                <div className="empty">{t("stalls.none")}</div>
            ) : (
                <div className="grid">
                    {visible.map((shop) => (
                        <ShopCard key={shop._id} shop={shop} />
                    ))}
                </div>
            )}
        </div>
    )
}