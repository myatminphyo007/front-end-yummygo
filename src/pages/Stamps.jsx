import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../api/axios"
import { useLang } from "../context/LanguageContext"
import TakoLoader from "../components/TakoLoader"
import Icon from "../components/Icon"
import MascotPet from "../components/MascotPet"

export default function Stamps() {
    const { t } = useLang()
    const [cards, setCards] = useState([])
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api
            .get("/reservations/stamps")
            .then((res) => {
                setCards(res.data.cards)
                setCoupons(res.data.coupons)
            })
            .finally(() => setLoading(false))
    }, [])

    if (loading)
        return (
            <div className="container">
                <TakoLoader size={64} label={t("stalls.loading")} />
            </div>
        )

    return (
        <div className="container">
            <div className="section-title">
                <h2>{t("stamps.title")}</h2>
                <Link className="btn outline small" to="/stalls">{t("res.find")}</Link>
            </div>

            <p className="muted">{t("stamps.subtitle")}</p>

            {/* my growing mascot */}
            <MascotPet />

            {/* free coupons */}
            <h3 className="stamps-h">
                <Icon name="gift" size={22} /> {t("stamps.coupons")}
            </h3>
            {coupons.length === 0 ? (
                <div className="empty">{t("stamps.noCoupons")}</div>
            ) : (
                coupons.map((c) => (
                    <div key={c._id} className="coupon-card">
                        <strong>{c.shop?.name}</strong>
                        <div className="coupon-code">{c.code.replace(/^FREE-/, "")}</div>
                        <p style={{ margin: "0 0 4px" }}>
                            <Icon name="gift" size={16} /> {t("stamps.reward")}: <strong>{c.rewardName}</strong>
                        </p>
                        <p className="muted" style={{ margin: 0 }}>{t("stamps.couponHint")}</p>
                    </div>
                ))
            )}

            {/* stamp cards in progress (one per stall) */}
            <h3 className="stamps-h">
                <Icon name="medal" size={22} /> {t("stamps.title")}
            </h3>
            {cards.length === 0 ? (
                <div className="empty">{t("stamps.noCards")}</div>
            ) : (
                cards.map((c) => (
                    <div key={c.shop._id} className="panel">
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                            <Link to={`/shop/${c.shop._id}`}>
                                <strong style={{ fontSize: 20, color: "var(--wine)" }}>{c.shop.name}</strong>
                            </Link>
                            <span className="muted">{t("stamps.progress", { n: c.progress, total: c.stampsNeeded })}</span>
                        </div>

                        <div className="stamp-row">
                            {Array.from({ length: c.stampsNeeded }, (_, i) => {
                                const earned = i < c.progress
                                const newest = earned && i === c.progress - 1
                                return (
                                    <div key={i} className={`stamp-dot ${earned ? "on" : ""}`}>
                                        {earned ? (
                                            <img
                                                className={`stamp-img ${newest ? "new" : ""}`}
                                                src="/stamp.png"
                                                alt={t("stamps.title")}
                                                style={{ "--tilt": `${((i * 7) % 9) - 4}deg` }}
                                            />
                                        ) : (
                                            i + 1
                                        )}
                                    </div>
                                )
                            })}
                            <div className="stamp-dot reward">
                                <Icon name="gift" size={30} />
                            </div>
                        </div>

                        {c.shop.rewardName && (
                            <p className="muted" style={{ margin: 0 }}>
                                <Icon name="gift" size={16} /> {t("stamps.reward")}: <strong>{c.shop.rewardName}</strong>
                            </p>
                        )}
                    </div>
                ))
            )}
        </div>
    )
}