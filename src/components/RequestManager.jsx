import { Fragment, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import { useToast } from "../context/ToastContext"
import { useLang } from "../context/LanguageContext"

const FILTERS = ["pending", "offered", "approved", "completed", "noshow", "declined", "cancelled", "all"]
const OPEN = ["pending", "approved", "offered"]

// the time of a reservation: the new fields first, then the old slot
const whenText = (r) => {
    if (r.date) return `${r.date} ${r.time}`
    if (r.slot) return `${r.slot.date} ${r.slot.time}`
    return "-"
}

export default function RequestManager() {
    const { showToast } = useToast()
    const { t } = useLang()
    const navigate = useNavigate()
    const [list, setList] = useState([])
    const [filter, setFilter] = useState("pending")
    const [code, setCode] = useState("")

    // suggest another time
    const [suggestId, setSuggestId] = useState(null)
    const [sDate, setSDate] = useState("")
    const [sTime, setSTime] = useState("")

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

    const openSuggest = (r) => {
        setSuggestId(r._id)
        setSDate(r.date || r.slot?.date || "")
        setSTime(r.time || r.slot?.time || "")
    }

    const sendSuggest = async (e) => {
        e.preventDefault()
        if (!sDate || !sTime) return

        try {
            await api.put(`/reservations/${suggestId}/suggest`, { date: sDate, time: sTime })
            showToast(t("req.suggestSent"))
            setSuggestId(null)
            load()
        } catch (err) {
            showToast(err.response?.data?.message || "Could not send")
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
    const hasFinished = list.some((r) => !OPEN.includes(r.status))

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
                                const finished = !OPEN.includes(r.status)

                                return (
                                    <Fragment key={r._id}>
                                        <tr>
                                            <td>{r.user?.name}</td>
                                            <td>
                                                <strong>{r.code}</strong>
                                            </td>
                                            <td>
                                                {whenText(r)}
                                                {r.status === "offered" && (
                                                    <div className="muted">
                                                        → {t("req.offeredTime", { date: r.offerDate, time: r.offerTime })}
                                                    </div>
                                                )}
                                            </td>
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
                                                        <button className="btn light small" onClick={() => openSuggest(r)}>
                                                            🕐 {t("req.suggest")}
                                                        </button>
                                                        <button className="btn danger small" onClick={() => setStatus(r._id, "declined")}>
                                                            {t("req.reject")}
                                                        </button>
                                                    </div>
                                                )}
                                                {r.status === "offered" && (
                                                    <span className="muted">{t("req.waitingAnswer")}</span>
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

                                        {suggestId === r._id && (
                                            <tr>
                                                <td colSpan="8">
                                                    <form className="suggest-row" onSubmit={sendSuggest}>
                                                        <strong>🕐 {t("req.suggest")}</strong>
                                                        <input
                                                            type="date"
                                                            value={sDate}
                                                            onChange={(e) => setSDate(e.target.value)}
                                                            required
                                                        />
                                                        <input
                                                            type="time"
                                                            value={sTime}
                                                            onChange={(e) => setSTime(e.target.value)}
                                                            required
                                                        />
                                                        <button className="btn small" type="submit">
                                                            {t("req.suggestSend")}
                                                        </button>
                                                        <button
                                                            className="btn outline small"
                                                            type="button"
                                                            onClick={() => setSuggestId(null)}
                                                        >
                                                            {t("req.suggestCancel")}
                                                        </button>
                                                        <span className="muted">{t("req.suggestHint", { minutes: 15 })}</span>
                                                    </form>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    )
}