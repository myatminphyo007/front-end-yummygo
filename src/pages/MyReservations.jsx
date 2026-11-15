import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { QRCodeSVG } from "qrcode.react"
import api from "../api/axios"
import { useToast } from "../context/ToastContext"
import { useLang } from "../context/LanguageContext"

export default function MyReservations() {
    const { showToast } = useToast()
    const { t } = useLang()
    const [list, setList] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [openQr, setOpenQr] = useState(null)

    const load = () =>
        api
            .get("/reservations/my")
            .then((res) => setList(res.data))
            .catch(() => setError("Could not load your reservations"))
            .finally(() => setLoading(false))

    useEffect(() => {
        load()
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

    if (loading) return <div className="container">{t("stalls.loading")}</div>

    const hasFinished = list.some((r) => !["pending", "approved"].includes(r.status))

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
                    const active = r.status === "pending" || r.status === "approved"

                    return (
                        <div key={r._id} className="card reservation">
                            <div>
                                <h3>{r.shop?.name || "-"}</h3>

                                {r.code && (
                                    <p style={{ margin: "0 0 6px" }}>
                                        {t("res.code")}:{" "}
                                        <strong style={{ letterSpacing: 2, color: "var(--wine)" }}>{r.code}</strong>
                                    </p>
                                )}

                                <p className="muted">
                                    {r.slot ? `${r.slot.date} · ${r.slot.time} · ` : ""}
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

                                {r.status === "completed" && r.shop?.stampRally && (
                                    <p style={{ margin: "8px 0 0" }}>🎉 {t("res.stampEarned")}</p>
                                )}

                                {openQr === r._id && r.code && (
                                    <div style={{ marginTop: 16 }}>
                                        <div
                                            style={{
                                                display: "inline-block",
                                                padding: 12,
                                                background: "#fff",
                                                border: "1px solid var(--border)",
                                                borderRadius: 12,
                                            }}
                                        >
                                            <QRCodeSVG
                                                value={`${window.location.origin}/ticket/${r.code}`}
                                                size={160}
                                                fgColor="#681b36"
                                            />
                                        </div>
                                        <p className="muted" style={{ margin: "8px 0 0" }}>{t("res.qrHint")}</p>
                                    </div>
                                )}
                            </div>

                            <div className="card-actions">
                                {r.code && active && (
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
                                    <button className="btn danger small" onClick={() => handleCancel(r._id)}>
                                        {t("res.cancel")}
                                    </button>
                                ) : (
                                    <button className="btn danger small" onClick={() => handleDelete(r._id)}>
                                        🗑 {t("res.delete")}
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })
            )}
        </div>
    )
}