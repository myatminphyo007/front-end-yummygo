import { useEffect, useState } from "react"
import api from "../api/axios"
import ShopCard from "../components/ShopCard"
import { SkeletonGrid } from "../components/Skeleton"
import useFavorites from "../utils/useFavorites"
import { useLang } from "../context/LanguageContext"

export default function Favorites() {
    const { t } = useLang()
    const { ids } = useFavorites()
    const [shops, setShops] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get("/shops")
            .then((r) => setShops(r.data))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    const list = shops.filter((s) => ids.includes(s._id))

    return (
        <div className="favs-page">
            <h2 className="section-title">♥ {t("fav.title")}</h2>
            {loading ? (
                <SkeletonGrid />
            ) : list.length === 0 ? (
                <p className="empty-fav">{t("fav.empty")}</p>
            ) : (
                <div className="grid">
                    {list.map((s) => (
                        <ShopCard key={s._id} shop={s} />
                    ))}
                </div>
            )}
        </div>
    )
}