import { Link } from "react-router-dom"
import { useLang } from "../context/LanguageContext"
import mapLink from "../utils/mapLink"
import StarRating from "./StarRating"

export default function ShopCard({ shop }) {
    const { t } = useLang()

    return (
        <div className="card">
            <div className="card-image">
                {shop.image ? <img src={shop.image} alt={shop.name} /> : "🍡"}
            </div>

            <div className="card-body">
                <h3>{shop.name}</h3>
                <p className="muted">
                    {shop.category} · {shop.festival?.name}
                    {shop.festival?.mapLocation && (
                        <>
                            {" "}
                            <a
                                className="map-link"
                                href={mapLink(shop.festival.mapLocation)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                📍 {t("shop.mapShort")}
                            </a>
                        </>
                    )}
                </p>

                {shop.stampRally && (
                    <p style={{ margin: "0 0 8px" }}>
                        <span className="status approved">🏅 {t("shop.stampRally")}</span>
                        {shop.rewardName && (
                            <span style={{ display: "block", marginTop: 6, fontSize: 14, color: "var(--wine)" }}>
                                🎁 {t("shop.rewardLine", { n: shop.stampsNeeded, reward: shop.rewardName })}
                            </span>
                        )}
                    </p>
                )}

                <p className="price">
                    <StarRating value={shop.avgRating} count={shop.reviewCount} />
                </p>
                <div className="card-actions">
                    <Link className="btn small" to={`/shop/${shop._id}`}>
                        {t("shop.viewReserve")}
                    </Link>
                </div>
            </div>
        </div>
    )
}