import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import api from "../api/axios"
import { useToast } from "../context/ToastContext"
import { useLang } from "../context/LanguageContext"
import { PersonAvatar } from "../components/PetFace"
import usePetLooks from "../utils/usePetLooks"

export default function Ticket() {
    const { code } = useParams()
    const { showToast } = useToast()
    const { t } = useLang()
    const [reservation, setReservation] = useState(null)
    const [loading, setLoading] = useState(true)
    const looks = usePetLooks([reservation?.user?._id])
    const look = looks[reservation?.user?._id]

    const load = () =>
        api
            .get(`/reservations/code/${code}`)
            .then((res) => setReservation(res.data))
            .catch(() => setReservation(null))
            .finally(() => setLoading(false))

    useEffect(() => {
        load()
    }, [code])

    const checkIn = async (result) => {
        try {
            const { data } = await api.put(`/reservations/${reservation._id}/checkin`, { result })

            if (result === "noshow") showToast(t("req.noshowDone"))
            else if (!data.stampGiven) showToast(t("req.arrivedNoStamp"))
            else if (data.couponCode) showToast(t("req.couponMade", { code: data.couponCode }))
            else showToast(t("req.arrivedStamp", { n: data.progress, total: data.stampsNeeded }))

            load()
        } catch (err) {
            showToast(err.response?.data?.message || "Could not check in")
        }
    }

    if (loading) return <div className="container">{t("stalls.loading")}</div>

    return (
        <div className="container">
            <div className="section-title">
                <h2>{t("ticket.title")}</h2>
                <Link className="btn outline small" to="/owner">{t("ticket.back")}</Link>
            </div>

            {!reservation ? (
                <div className="empty">{t("ticket.notFound")}</div>
            ) : (
                <div className="panel">
                    <h1 style={{ letterSpacing: 3, color: "var(--wine)" }}>{reservation.code}</h1>

                    <p>
                        <strong>{t("ticket.visitor")}:</strong> {reservation.user?.name}
                    </p>
                    {look && (
                        <div className="visitor-pet">
                            <PersonAvatar look={look} name={reservation.user?.name} size={64} />
                            <div>
                                <small className="muted">{t("pet.visitorPet")}</small>
                                <br />
                                <strong>{look.name || "-"}</strong>
                            </div>
                        </div>
                    )}
                    <p>
                        <strong>{t("req.datetime")}:</strong>{" "}
                        {reservation.date
                            ? `${reservation.date} ${reservation.time}`
                            : reservation.slot
                              ? `${reservation.slot.date} ${reservation.slot.time}`
                              : "-"}
                    </p>
                    <p>
                        <strong>{t("req.people")}:</strong> {reservation.people}
                    </p>
                    {reservation.note && (
                        <p>
                            <strong>{t("req.note")}:</strong> {reservation.note}
                        </p>
                    )}

                    {reservation.items?.length > 0 && (
                        <div className="order-box">
                            <strong>🍡 {t("order.prepare")}</strong>
                            {reservation.items.map((i) => (
                                <div key={i._id} className="order-line">
                                    <span>{i.name} × {i.quantity}</span>
                                    <span>¥{(i.price * i.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="order-total">
                                {t("order.total")}: ¥{reservation.total.toLocaleString()}
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: 10 }}>
                        <span className={`status ${reservation.status}`}>{t(`status.${reservation.status}`)}</span>
                    </div>

                    {reservation.status === "approved" && (
                        <div style={{ marginTop: 24 }}>
                            <h3>{t("ticket.checkinTitle")}</h3>
                            <p className="muted">{t("ticket.checkinHint")}</p>
                            <div className="card-actions">
                                <button className="btn" onClick={() => checkIn("completed")}>
                                    ✓ {t("req.arrived")}
                                </button>
                                <button className="btn danger" onClick={() => checkIn("noshow")}>
                                    ✗ {t("req.noshow")}
                                </button>
                            </div>
                        </div>
                    )}

                    {(reservation.status === "completed" || reservation.status === "noshow") && (
                        <p className="muted" style={{ marginTop: 16 }}>{t("ticket.done")}</p>
                    )}
                </div>
            )}
        </div>
    )
}