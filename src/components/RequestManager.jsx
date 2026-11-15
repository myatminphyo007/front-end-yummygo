import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import { useToast } from "../context/ToastContext"
import { useLang } from "../context/LanguageContext"

const FILTERS = ["pending", "approved", "completed", "noshow", "declined", "cancelled", "all"]

export default function RequestManager() {
    const { showToast } = useToast()
    const { t } = useLang()
    const navigate = useNavigate()
    const [list, setList] = useState([])
    const [filter, setFilter] = useState("pending")
    const [code, setCode] = useState("")

    const load = () => api.get("/reservations/shop").then((res) => setList(res.data))

    useEffect(() => {
        load()
    }, [])

    const setStatus = async (id, status) => {
        try {
            await api.put(`/reservations/${id}/status`, { status })
            showToast(status === "approved" ? t("req.approved") : t("req.rejected"))
            load()
        } catch (err) {
            showToast(err.response?.data?.message || "Could not update")
        }
    }

    const checkIn = async (id, result) => {
        try {
            const { data } = await api.put(`/reservations/${id}/checkin`, { result })

            if (result === "noshow") showToast(t("req.noshowDone"))
            else if (!data.stampGiven) showToast(t("req.arrivedNoStamp"))
            else if (data.couponCode) showToast(t("req.couponMade", { code: data.couponCode }))
            else showToast(t("req.arrivedStamp", { n: data.progress, total: data.stampsNeeded }))

            load()
        } catch (err) {
            showToast(err.response?.data?.message || "Could not check in")
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm(t("req.confirmDelete"))) return

        try {
            await api.delete(`/reservations/shop/${id}`)
            showToast(t("req.deleted"))
            load()
        } catch (err) {
            showToast(err.response?.data?.message || "Could not delete")
        }
    }

    const handleClear = async () => {
        if (!window.confirm(t("req.confirmClear"))) return

        try {
            await api.delete("/reservations/shop/history")
            showToast(t("req.cleared"))
            load()
        } catch (err) {
            showToast(err.response?.data?.message || "Could not clear")
        }
    }

    const handleFind = (e) => {
        e.preventDefault()
        if (code.trim()) navigate(`/ticket/${code.trim().toUpperCase()}`)
    }

    const visible = filter === "all" ? list : list.filter((r) => r.status === filter)
    const pendingCount = list.filter((r) => r.status === "pending").length
    const hasFinished = list.some((r) => !["pending", "approved"].includes(r.status))

    return (
        <>
            <div className="section-title" style={{ marginTop: 40 }}>
                <h2>
                    {t("req.title")} {pendingCount > 0 && t("req.waiting", { n: pendingCount })}
                </h2>
                {hasFinished && (
                    <button className="btn danger small" onClick={handleClear}>
                        🗑 {t("req.clear")}
                    </button>
                )}
            </div>

            <form className="search-row" onSubmit={handleFind} style={{ margin: "0 0 20px" }}>
                <input
                    placeholder={t("ticket.findPlaceholder")}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
                <button className="btn" type="submit">{t("ticket.find")}</button>
            </form>

            <div className="filters">
                {FILTERS.map((f) => (
                    <button
                        key={f}
                        className={`chip ${filter === f ? "active" : ""}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === "all" ? t("req.all") : t(`status.${f}`)}
                    </button>
                ))}
            </div>

            {visible.length === 0 ? (
                <div className="empty">{t("req.none")}</div>
            ) : (
                <div className="panel table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>{t("req.visitor")}</th>
                                <th>{t("req.code")}</th>
                                <th>{t("req.datetime")}</th>
                                <th>{t("req.people")}</th>
                                <th>{t("order.column")}</th>
                                <th>{t("req.note")}</th>
                                <th>{t("req.status")}</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((r) => {
                                const finished = !["pending", "approved"].includes(r.status)

                                return (
                                    <tr key={r._id}>
                                        <td>{r.user?.name}</td>
                                        <td>
                                            <strong>{r.code}</strong>
                                        </td>
                                        <td>{r.slot ? `${r.slot.date} ${r.slot.time}` : "-"}</td>
                                        <td>{r.people}</td>
                                        <td>
                                            {r.items?.length > 0 ? (
                                                <>
                                                    {r.items.map((i) => (
                                                        <div key={i._id}>
                                                            {i.name} × {i.quantity}
                                                        </div>
                                                    ))}
                                                    <strong>¥{r.total.toLocaleString()}</strong>
                                                </>
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                        <td>{r.note}</td>
                                        <td>
                                            <span className={`status ${r.status}`}>{t(`status.${r.status}`)}</span>
                                        </td>
                                        <td>
                                            {r.status === "pending" && (
                                                <div className="card-actions">
                                                    <button className="btn small" onClick={() => setStatus(r._id, "approved")}>
                                                        {t("req.approve")}
                                                    </button>
                                                    <button className="btn danger small" onClick={() => setStatus(r._id, "declined")}>
                                                        {t("req.reject")}
                                                    </button>
                                                </div>
                                            )}
                                            {r.status === "approved" && (
                                                <div className="card-actions">
                                                    <button className="btn small" onClick={() => checkIn(r._id, "completed")}>
                                                        ✓ {t("req.arrived")}
                                                    </button>
                                                    <button className="btn danger small" onClick={() => checkIn(r._id, "noshow")}>
                                                        ✗ {t("req.noshow")}
                                                    </button>
                                                </div>
                                            )}
                                            {finished && (
                                                <button className="btn danger small" onClick={() => handleDelete(r._id)}>
                                                    🗑 {t("req.delete")}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    )
}