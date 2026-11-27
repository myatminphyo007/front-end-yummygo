import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { QRCodeSVG } from "qrcode.react"
import api from "../api/axios"
import { useToast } from "../context/ToastContext"
import { useLang } from "../context/LanguageContext"
import TakoLoader from "../components/TakoLoader"
import PetFace from "../components/PetFace"

const ACTIVE = ["pending", "approved", "offered"]

// the time of a reservation: the new fields first, then the old slot
const whenText = (r) => {
    if (r.date) return `${r.date} ${r.time}`
    if (r.slot) return `${r.slot.date} ${r.slot.time}`
    return ""
}

// counts down to the moment the suggestion expires
function Countdown({ until, onDone }) {
    const [left, setLeft] = useState(() => new Date(until).getTime() - Date.now())

    useEffect(() => {
        const timer = setInterval(() => {
            const ms = new Date(until).getTime() - Date.now()
            setLeft(ms)
            if (ms <= 0) {
                clearInterval(timer)
                onDone()
            }
        }, 1000)
        return () => clearInterval(timer)
    }, [until])

    const total = Math.max(0, Math.floor(left / 1000))
    const mm = String(Math.floor(total / 60)).padStart(2, "0")
    const ss = String(total % 60).padStart(2, "0")

    return <strong>{mm}:{ss}</strong>
}

export default function MyReservations() {
    const { showToast } = useToast()
    const { t } = useLang()
    const [list, setList] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [openQr, setOpenQr] = useState(null)
    const [pet, setPet] = useState(null) // my own mascot, shown on every ticket

    const load = () =>
        api
            .get("/reservations/my")
            .then((res) => setList(res.data))
            .catch(() => setError("Could not load your reservations"))
            .finally(() => setLoading(false))

    useEffect(() => {
        load()
        api.get("/pet").then((res) => setPet(res.data)).catch(() => {})
    }, [])

    const handleCancel = async (id) => {
        if (!window.confirm(t("res.confirmCancel"))) return

        try {
            await api.put(`/reservations/${id}/cancel`)
            showToast(t("res.cancelled"))
            load()
        } catch (err) {
            showToast(err.response?.data?.message || "Could not cancel")
        }
    }

    const handleAccept = async (id) => {
        try {
            await api.put(`/reservations/${id}/accept`)
            showToast(t("res.offerAccepted"))
            load()
        } catch (err) {
            showToast(err.response?.data?.message || "Could not accept")
            load()
        }
    }

    const handleDeclineOffer = async (id) => {
        try {
            await api.put(`/reservations/${id}/decline-offer`)
            showToast(t("res.offerDeclined"))
            load()
        } catch (err) {
            showToast(err.response?.data?.message || "Could not decline")
            load()
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm(t("res.confirmDelete"))) return

        try {
            await api.delete(`/reservations/${id}`)
            showToast(t("res.deleted"))
            load()
        } catch (err) {
            showToast(err.response?.data?.message || "Could not delete")
        }
    }

    const handleClear = async () => {
        if (!window.confirm(t("res.confirmClear"))) return

        try {
            await api.delete("/reservations/history")
            showToast(t("res.cleared"))
            load()
        } catch (err) {
            showToast(err.response?.data?.message || "Could not clear")
        }
    }

    if (loading)
        return (
            <div className="container">
                <TakoLoader size={64} label={t("stalls.loading")} />
            </div>
        )

    const hasFinished = list.some((r) => !ACTIVE.includes(r.status))

    return (
        <div className="container">
            <div className="section-title">
                <h2>{t("res.title")}</h2>
                <div className="card-actions">
                    {hasFinished && (
                        <button className="btn danger small" onClick={handleClear}>
                            🗑 {t("res.clear")}
                        </button>
                    )}
                    <Link className="btn outline small" to="/stalls">{t("res.find")}</Link>
                </div>
            </div>

            {error && <p className="error-text">{error}</p>}

            {list.length === 0 ? (
                <div className="empty">{t("res.none")}</div>
            ) : (
                list.map((r) => {
                    const active = ACTIVE.includes(r.status)
                    const when = whenText(r)

                    return (
                        <div key={r._id} className={`ticket-card ${r.status}`}>
                            {/* main part of the ticket */}
                            <div className="ticket-main">
                                <h3>{r.shop?.name || "-"}</h3>

                                <p className="muted">
                                    {when ? `${when} · ` : ""}
                                    {r.people} {r.people === 1 ? t("res.person") : t("res.people")}
                                </p>
                                {r.note && <p className="muted">{t("res.note")}: {r.note}</p>}

                                {r.items?.length > 0 && (
                                    <div className="order-box">
                                        <strong>🍡 {t("order.items")}</strong>
                                        {r.items.map((i) => (
                                            <div key={i._id} className="order-line">
                                                <span>{i.name} × {i.quantity}</span>
                                                <span>¥{(i.price * i.quantity).toLocaleString()}</span>
                                            </div>
                                        ))}
                                        <div className="order-total">
                                            {t("order.total")}: ¥{r.total.toLocaleString()}
                                        </div>
                                        <p className="muted" style={{ margin: "6px 0 0" }}>{t("order.payAtStall")}</p>
                                    </div>
                                )}

                                <div style={{ marginTop: 10 }}>
                                    <span className={`status ${r.status}`}>{t(`status.${r.status}`)}</span>
                                </div>

                                {/* the stall suggested another time */}
                                {r.status === "offered" && (
                                    <div className="offer-box">
                                        <strong>🕐 {t("res.offerTitle")}</strong>
                                        <p style={{ margin: "6px 0 0" }}>
                                            {t("res.offerRequested", { date: r.date, time: r.time })}
                                        </p>
                                        <p className="offer-new">
                                            {t("res.offerBody", { date: r.offerDate, time: r.offerTime })}
                                        </p>
                                        <p style={{ margin: "0 0 10px" }}>
                                            {t("res.offerLeft")}{" "}
                                            <Countdown until={r.offerExpiresAt} onDone={load} />
                                        </p>
                                        <div className="card-actions">
                                            <button className="btn small" onClick={() => handleAccept(r._id)}>
                                                ✓ {t("res.accept")}
                                            </button>
                                            <button
                                                className="btn danger small"
                                                onClick={() => handleDeclineOffer(r._id)}
                                            >
                                                ✗ {t("res.declineOffer")}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {r.status === "completed" && r.shop?.stampRally && (
                                    <p style={{ margin: "8px 0 0" }}>🎉 {t("res.stampEarned")}</p>
                                )}
                            </div>

                            {/* tear-off stub */}
                            <div className="ticket-side">
                                {pet && r.code && (
                                    <div className="ticket-pet">
                                        <PetFace look={pet} size={58} />
                                        {pet.name && <small>{pet.name}</small>}
                                    </div>
                                )}

                                {r.code && (
                                    <>
                                        <span className="ticket-label">{t("res.code")}</span>
                                        <strong className="ticket-code">{r.code}</strong>
                                    </>
                                )}

                                {openQr === r._id && r.code && (
                                    <div className="ticket-qr">
                                        <div className="ticket-qr-box">
                                            <QRCodeSVG
                                                value={`${window.location.origin}/ticket/${r.code}`}
                                                size={140}
                                                fgColor="#681b36"
                                            />
                                        </div>
                                        <p className="muted" style={{ margin: "6px 0 0" }}>{t("res.qrHint")}</p>
                                    </div>
                                )}

                                <div className="card-actions">
                                    {r.code && (r.status === "pending" || r.status === "approved") && (
                                        <button
                                            className="btn outline small"
                                            onClick={() => setOpenQr(openQr === r._id ? null : r._id)}
                                        >
                                            {openQr === r._id ? t("res.hideQr") : t("res.showQr")}
                                        </button>
                                    )}
                                    {r.shop && (
                                        <Link className="btn light small" to={`/shop/${r.shop._id}`}>
                                            {r.status === "approved" || r.status === "completed"
                                                ? t("res.review")
                                                : t("res.view")}
                                        </Link>
                                    )}
                                    {active ? (
                                        r.status !== "offered" && (
                                            <button className="btn danger small" onClick={() => handleCancel(r._id)}>
                                                {t("res.cancel")}
                                            </button>
                                        )
                                    ) : (
                                        <button className="btn danger small" onClick={() => handleDelete(r._id)}>
                                            🗑 {t("res.delete")}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })
            )}
        </div>
    )
}