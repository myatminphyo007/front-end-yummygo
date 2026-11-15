import { useEffect, useState } from "react"
import api from "../api/axios"
import { useToast } from "../context/ToastContext"
import { useLang } from "../context/LanguageContext"

export default function MenuManager({ shop }) {
    const { showToast } = useToast()
    const { t } = useLang()
    const [items, setItems] = useState([])
    const [form, setForm] = useState({ name: "", description: "", price: "" })
    const [image, setImage] = useState(null)
    const [error, setError] = useState("")

    const load = () => api.get(`/menu/shop/${shop._id}`).then((res) => setItems(res.data))

    useEffect(() => {
        load()
    }, [])

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleAdd = async (e) => {
        e.preventDefault()
        setError("")
        const formElement = e.target
        try {
            const data = new FormData()
            Object.entries(form).forEach(([key, value]) => data.append(key, value))
            if (image) data.append("image", image)

            await api.post("/menu", data)
            showToast(t("menu.added"))
            setForm({ name: "", description: "", price: "" })
            setImage(null)
            formElement.reset()
            load()
        } catch (err) {
            setError(err.response?.data?.message || "Could not add menu item")
        }
    }

    const toggleAvailable = async (item) => {
        try {
            await api.put(`/menu/${item._id}`, { available: !item.available })
            load()
        } catch (err) {
            showToast(err.response?.data?.message || "Could not update")
        }
    }

    // change or add the photo of an existing dish
    const changePhoto = async (item, file) => {
        if (!file) return
        try {
            const data = new FormData()
            data.append("image", file)
            await api.put(`/menu/${item._id}`, data)
            showToast(t("menu.photoUpdated"))
            load()
        } catch (err) {
            showToast(err.response?.data?.message || "Could not update photo")
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm(t("menu.confirmDelete"))) return
        try {
            await api.delete(`/menu/${id}`)
            showToast(t("menu.deleted"))
            load()
        } catch (err) {
            showToast(err.response?.data?.message || "Could not delete")
        }
    }

    return (
        <>
            <div className="section-title" style={{ marginTop: 40 }}>
                <h2>{t("menu.title")}</h2>
            </div>

            <form className="panel inline-form" onSubmit={handleAdd}>
                {error && <p className="error-text full">{error}</p>}

                <label>
                    {t("menu.name")}
                    <input name="name" value={form.name} onChange={handleChange} required />
                </label>

                <label>
                    {t("menu.price")}
                    <input type="number" min="0" name="price" value={form.price} onChange={handleChange} required />
                </label>

                <label className="full">
                    {t("menu.description")}
                    <input name="description" value={form.description} onChange={handleChange} />
                </label>

                <label className="full">
                    {t("menu.photo")}
                    <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                </label>

                <div className="full">
                    <button className="btn" type="submit">{t("menu.add")}</button>
                </div>
            </form>

            {items.length === 0 ? (
                <div className="empty">{t("menu.none")}</div>
            ) : (
                <div className="panel">
                    {items.map((item) => (
                        <div key={item._id} className={`menu-item ${item.available ? "" : "sold-out"}`}>
                            <div className="menu-main">
                                <div className="menu-thumb">
                                    {item.image ? <img src={item.image} alt={item.name} /> : "🍡"}
                                </div>
                                <div>
                                    <strong>{item.name}</strong> · ¥{item.price.toLocaleString()}
                                    {!item.available && ` ${t("menu.soldOut")}`}
                                    <div className="muted">{item.description}</div>
                                </div>
                            </div>

                            <div className="card-actions">
                                <label className="btn outline small" style={{ margin: 0, cursor: "pointer" }}>
                                    📷 {t("menu.changePhoto")}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={(e) => {
                                            changePhoto(item, e.target.files[0])
                                            e.target.value = ""
                                        }}
                                    />
                                </label>
                                <button className="btn light small" onClick={() => toggleAvailable(item)}>
                                    {item.available ? t("menu.markSoldOut") : t("menu.markAvailable")}
                                </button>
                                <button className="btn danger small" onClick={() => handleDelete(item._id)}>
                                    {t("menu.delete")}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}