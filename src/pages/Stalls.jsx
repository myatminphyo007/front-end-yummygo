import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import api from "../api/axios"
import { useLang } from "../context/LanguageContext"
import ShopCard from "../components/ShopCard"

export default function Stalls() {
    const { t } = useLang()
    const [params] = useSearchParams()
    const [shops, setShops] = useState([])
    const [festivals, setFestivals] = useState([])
    const [festival, setFestival] = useState("")
    const [sort, setSort] = useState("newest")
    const [category, setCategory] = useState("ALL")
    const [search, setSearch] = useState(params.get("search") || "")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get("/festivals").then((res) => setFestivals(res.data))
    }, [])

    useEffect(() => {
        setLoading(true)
        const query = {}
        if (festival) query.festival = festival
        if (sort === "rating") query.sort = "rating"

        api.get("/shops", { params: query })
            .then((res) => setShops(res.data))
            .finally(() => setLoading(false))
    }, [festival, sort])

    const categories = ["ALL", ...new Set(shops.map((s) => s.category).filter(Boolean))]

    const visible = shops.filter((s) => {
        const okCategory = category === "ALL" || s.category === category
        const text = `${s.name} ${s.category} ${s.description}`.toLowerCase()
        return okCategory && text.includes(search.toLowerCase())
    })

    return (
        <div className="container">
            <div className="section-title">
                <h2>{t("stalls.title")}</h2>
            </div>

            <div className="search-row">
                <input
                    placeholder={t("stalls.search")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select value={festival} onChange={(e) => setFestival(e.target.value)}>
                    <option value="">{t("stalls.allFestivals")}</option>
                    {festivals.map((f) => (
                        <option key={f._id} value={f._id}>
                            {f.name} ({f.place})
                        </option>
                    ))}
                </select>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="newest">{t("stalls.newest")}</option>
                    <option value="rating">{t("stalls.bestRated")}</option>
                </select>
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

            {loading ? (
                <p>{t("stalls.loading")}</p>
            ) : visible.length === 0 ? (
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