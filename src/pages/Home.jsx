import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../api/axios"
import { useLang } from "../context/LanguageContext"
import ShopCard from "../components/ShopCard"

export default function Home() {
    const navigate = useNavigate()
    const { t } = useLang()
    const [search, setSearch] = useState("")
    const [shops, setShops] = useState([])

    useEffect(() => {
        api.get("/shops", { params: { sort: "rating" } }).then((res) => setShops(res.data.slice(0, 3)))
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        navigate(`/stalls?search=${encodeURIComponent(search)}`)
    }

    return (
        <>
            <section className="hero">
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
                    <h2>{t("home.topRated")}</h2>
                    <Link className="btn outline small" to="/stalls">{t("home.seeAll")}</Link>
                </div>

                {shops.length === 0 ? (
                    <div className="empty">{t("home.noStalls")}</div>
                ) : (
                    <div className="grid">
                        {shops.map((shop) => (
                            <ShopCard key={shop._id} shop={shop} />
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}