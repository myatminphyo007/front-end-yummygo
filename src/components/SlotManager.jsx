import { useEffect, useState } from "react"
import api from "../api/axios"
import { useToast } from "../context/ToastContext"
import { useLang } from "../context/LanguageContext"
import { dateOnly } from "../utils/festivalDates"

export default function SlotManager({ shop }) {
    const { showToast } = useToast()
    const { t } = useLang()
    const [slots, setSlots] = useState([])
    const [form, setForm] = useState({ date: "", time: "", capacity: 4 })
    const [error, setError] = useState("")

    // festival days (empty string = no limit, the server still checks)
    const minDate = dateOnly(shop?.festival?.startDate)
    const maxDate = dateOnly(shop?.festival?.endDate)

    const load = () => api.get(`/slots/shop/${shop._id}`).then((res) => setSlots(res.data))

    useEffect(() => {
        load()
    }, [])

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleAdd = async (e) => {
        e.preventDefault()
        setError("")
        try {
            await api.post("/slots", { ...form, capacity: Number(form.capacity) })
            showToast(t("slot.added"))
            load()
        } catch (err) {
            setError(err.response?.data?.message || "Could not add time slot")
        }
    }

    const handleDelete = async (id) => {
        try {
            await api.delete(`/slots/${id}`)
            showToast(t("slot.deleted"))
            load()
        } catch (err) {
            showToast(err.response?.data?.message || "Could not delete")
        }
    }

    return (
        <>
            <div className="section-title" style={{ marginTop: 40 }}>
                <h2>{t("slot.title")}</h2>
            </div>

            {minDate && maxDate && (
                <p className="muted" style={{ marginBottom: 10 }}>
                    📅 {minDate} - {maxDate}
                </p>
            )}

            <form className="panel inline-form" onSubmit={handleAdd}>
                {error && <p className="error-text full">{error}</p>}

                <label>
                    {t("slot.date")}
                    <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        min={minDate || undefined}
                        max={maxDate || undefined}
                        required
                    />
                </label>

                <label>
                    {t("slot.time")}
                    <input type="time" name="time" value={form.time} onChange={handleChange} required />
                </label>

                <label>
                    {t("slot.capacity")}
                    <input
                        type="number"
                        min="1"
                        name="capacity"
                        value={form.capacity}
                        onChange={handleChange}
                        required
                    />
                </label>

                <div style={{ alignSelf: "end" }}>
                    <button className="btn" type="submit" style={{ width: "100%" }}>
                        {t("slot.add")}
                    </button>
                </div>
            </form>

            {slots.length === 0 ? (
                <div className="empty">{t("slot.none")}</div>
            ) : (
                <div className="panel table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>{t("slot.date")}</th>
                                <th>{t("slot.time")}</th>
                                <th>{t("slot.capacity")}</th>
                                <th>{t("slot.left")}</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {slots.map((s) => (
                                <tr key={s._id}>
                                    <td>{s.date}</td>
                                    <td>{s.time}</td>
                                    <td>{s.capacity}</td>
                                    <td>{s.full ? t("slot.full") : s.remaining}</td>
                                    <td>
                                        <button className="btn danger small" onClick={() => handleDelete(s._id)}>
                                            {t("slot.delete")}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    )
}