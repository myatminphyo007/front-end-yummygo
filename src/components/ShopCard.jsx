import { Link } from "react-router-dom"
import { useLang } from "../context/LanguageContext"
import mapLink from "../utils/mapLink"
import { festivalRange, isEnded } from "../utils/festivalDates"
import StarRating from "./StarRating"
import FavButton from "./FavButton"
import Icon from "./Icon"

export default function ShopCard({ shop }) {
    const { t } = useLang()
    const range = festivalRange(shop.festival)
    const ended = isEnded(shop.festival)

    return (
        <div className="card">
            <div className="card-image">
                {shop.image ? <img src={shop.image} alt={shop.name} /> : "🍡"}
                <FavButton id={shop._id} />
            </div>

            <div className="card-body">
                <h3>{shop.name}</h3>
                <p className="muted">
                    {shop.category} · {shop.festival?.name}
                    {shop.festival?.mapLocation && (
                        <>
                            {" "}
                            <a
                                className="map-link nav-ico"
                                href={mapLink(shop.festival.mapLocation)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Icon name="pin" size={14} /> {t("shop.mapShort")}
                            </a>
                        </>
                    )}
                </p>

                {range && (
                    <p className="muted nav-ico" style={{ margin: "0 0 8px" }}>
                        <Icon name="calendar" size={15} /> {range}{" "}
                        {ended && <span className="status cancelled">{t("shop.festivalEnded")}</span>}
                    </p>
                )}

                {shop.stampRally && (
                    <p style={{ margin: "0 0 8px" }}>
                        <span className="status approved nav-ico">
                            <Icon name="medal" size={14} /> {t("shop.stampRally")}
                        </span>
                        {shop.rewardName && (
                            <span
                                className="nav-ico"
                                style={{ display: "flex", marginTop: 6, fontSize: 14, color: "var(--wine)" }}
                            >
                                <Icon name="gift" size={15} />{" "}
                                {t("shop.rewardLine", { n: shop.stampsNeeded, reward: shop.rewardName })}
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