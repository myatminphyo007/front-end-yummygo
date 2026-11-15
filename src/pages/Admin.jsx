import { useEffect, useState } from "react"
import api from "../api/axios"
import { useToast } from "../context/ToastContext"
import { useLang } from "../context/LanguageContext"
import mapLink from "../utils/mapLink"

const EMPTY = { name: "", place: "", startDate: "", endDate: "", description: "", mapLocation: "" }

export default function Admin() {
    const { showToast } = useToast()
    const { t } = useLang()
    const [festivals, setFestivals] = useState([])
    const [form, setForm] = useState(EMPTY)
    const [editingId, setEditingId] = useState(null)
    const [error, setError] = useState("")

    const load = () => api.get("/festivals").then((res) => setFestivals(res.data))

    useEffect(() => {
        load()
    }, [])

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const cancelEdit = () => {
        setEditingId(null)
        setForm(EMPTY)
        setError("")
    }

    const startEdit = (f) => {
        setEditingId(f._id)
        setForm({
            name: f.name || "",
            place: f.place || "",
            startDate: f.startDate?.slice(0, 10) || "",
            endDate: f.endDate?.slice(0, 10) || "",
            description: f.description || "",
            mapLocation: f.mapLocation || "",
        })
        setError("")
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        try {
            if (editingId) {
                await api.put(`/festivals/${editingId}`, form)
                showToast(t("admin.updated"))
            } else {
                await api.post("/festivals", form)
                showToast(t("admin.created"))
            }
            cancelEdit()
            load()
        } catch (err) {
            setError(err.response?.data?.message || "Could not save festival")
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm(t("admin.confirmDelete"))) return
        try {
            await api.delete(`/festivals/${id}`)
            showToast(t("admin.deleted"))
            if (editingId === id) cancelEdit()
            load()
        } catch (err) {
            showToast(err.response?.data?.message || "Could not delete")
        }
    }

    return (
        <div className="container">
            <div className="section-title">
                <h2>{t("admin.title")}</h2>
            </div>

            <form className="panel inline-form" onSubmit={handleSubmit}>
                {editingId && <p className="full"><strong>✏️ {t("admin.editing")}</strong></p>}
                {error && <p className="error-text full">{error}</p>}

                <label>
                    {t("admin.name")}
                    <input name="name" value={form.name} onChange={handleChange} required />
                </label>
                <label>
                    {t("admin.place")}
                    <input name="place" value={form.place} onChange={handleChange} required />
                </label>
                <label>
                    {t("admin.start")}
                    <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
                </label>
                <label>
                    {t("admin.end")}
                    <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
                </label>

                <label className="full">
                    📍 {t("admin.mapLocation")}
                    <input
                        name="mapLocation"
                        maxLength="500"
                        value={form.mapLocation}
                        onChange={handleChange}
                    />
                    <span className="muted" style={{ fontWeight: 400, fontSize: 14 }}>{t("admin.mapHint")}</span>
                    {form.mapLocation.trim() && (
                        <>
                            <br />
                            <a
                                className="map-link"
                                href={mapLink(form.mapLocation)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                📍 {t("admin.mapTest")}
                            </a>
                        </>
                    )}
                </label>

                <label className="full">
                    {t("admin.description")}
                    <textarea name="description" rows="2" value={form.description} onChange={handleChange} />
                </label>

                <div className="full card-actions">
                    <button className="btn" type="submit">
                        {editingId ? t("admin.save") : t("admin.create")}
                    </button>
                    {editingId && (
                        <button className="btn outline" type="button" onClick={cancelEdit}>
                            {t("admin.cancel")}
                        </button>
                    )}
                </div>
            </form>

            {festivals.length === 0 ? (
                <div className="empty">{t("admin.none")}</div>
            ) : (
                <div className="panel table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>{t("admin.colName")}</th>
                                <th>{t("admin.colPlace")}</th>
                                <th>{t("admin.colDates")}</th>
                                <th>{t("admin.colMap")}</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {festivals.map((f) => (
                                <tr key={f._id}>
                                    <td>{f.name}</td>
                                    <td>{f.place}</td>
                                    <td>
                                        {f.startDate?.slice(0, 10)} {t("admin.to")} {f.endDate?.slice(0, 10)}
                                    </td>
                                    <td>
                                        {f.mapLocation ? (
                                            <a
                                                className="map-link"
                                                href={mapLink(f.mapLocation)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                📍
                                            </a>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                    <td>
                                        <div className="card-actions">
                                            <button className="btn light small" onClick={() => startEdit(f)}>
                                                ✏️ {t("admin.edit")}
                                            </button>
                                            <button className="btn danger small" onClick={() => handleDelete(f._id)}>
                                                {t("admin.delete")}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}