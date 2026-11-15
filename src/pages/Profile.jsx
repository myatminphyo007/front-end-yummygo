import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"
import { useLang } from "../context/LanguageContext"
import StarRating from "../components/StarRating"

export default function Profile() {
    const { user } = useAuth()
    const { t } = useLang()
    const [shop, setShop] = useState(null)
    const [reservations, setReservations] = useState([])

    useEffect(() => {
        if (user.role === "owner") {
            api.get("/shops/my").then((res) => setShop(res.data)).catch(() => setShop(null))
        }
        if (user.role === "customer") {
            api.get("/reservations/my").then((res) => setReservations(res.data))
        }
    }, [user.role])

    const active = reservations.filter((r) => r.status === "pending" || r.status === "approved")

    return (
        <div className="container">
            {/* top card: same for everyone */}
            <div className="panel" style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                <div
                    style={{
                        width: 110,
                        height: 110,
                        borderRadius: "50%",
                        overflow: "hidden",
                        background: "var(--pink)",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 48,
                    }}
                >
                    {user.profileImage ? (
                        <img
                            src={user.profileImage}
                            alt={user.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (
                        user.name?.charAt(0).toUpperCase()
                    )}
                </div>

                <div>
                    <h1 style={{ margin: "0 0 6px", fontSize: 34, color: "var(--wine)" }}>{user.name}</h1>
                    <p className="muted" style={{ margin: 0 }}>{user.email}</p>
                    <span className="status approved" style={{ marginTop: 10 }}>
                        {t(`profile.role.${user.role}`)}
                    </span>
                </div>
            </div>

            {/* owner */}
            {user.role === "owner" && (
                <div className="panel">
                    <h2>{t("profile.myStall")}</h2>
                    {shop ? (
                        <>
                            <h3 style={{ marginBottom: 4 }}>{shop.name}</h3>
                            <p className="muted">{shop.category} · {shop.festival?.name}</p>
                            <p className="price">
                                <StarRating value={shop.avgRating} count={shop.reviewCount} />
                            </p>
                            <div className="card-actions">
                                <Link className="btn" to="/owner">{t("profile.edit")}</Link>
                                <Link className="btn light" to={`/shop/${shop._id}`}>{t("profile.viewPublic")}</Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="muted">{t("profile.noStall")}</p>
                            <Link className="btn" to="/owner">{t("profile.create")}</Link>
                        </>
                    )}
                </div>
            )}

            {/* visitor */}
            {user.role === "customer" && (
                <div className="panel">
                    <h2>{t("nav.myReservations")}</h2>
                    <p className="muted">{active.length} / {reservations.length}</p>
                    <div className="card-actions">
                        <Link className="btn" to="/my-reservations">{t("nav.myReservations")}</Link>
                        <Link className="btn light" to="/stalls">{t("res.find")}</Link>
                    </div>
                </div>
            )}

            {/* admin */}
            {user.role === "admin" && (
                <div className="panel">
                    <h2>{t("nav.admin")}</h2>
                    <Link className="btn" to="/admin">{t("admin.title")}</Link>
                </div>
            )}
        </div>
    )
}