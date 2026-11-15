import { useEffect, useMemo, useState } from "react"
import api from "../api/axios"
import { useToast } from "../context/ToastContext"
import { useLang } from "../context/LanguageContext"
import RequestManager from "../components/RequestManager"
import CouponManager from "../components/CouponManager"
import SlotManager from "../components/SlotManager"
import MenuManager from "../components/MenuManager"

const EMPTY_FORM = { festival: "", name: "", category: "", description: "", locationNote: "" }
const MAX_GALLERY = 3

export default function OwnerDashboard() {
    const { showToast } = useToast()
    const { t } = useLang()
    const [shop, setShop] = useState(null)
    const [festivals, setFestivals] = useState([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState(EMPTY_FORM)
    const [stampRally, setStampRally] = useState(false)
    const [stampsNeeded, setStampsNeeded] = useState(3)
    const [rewardName, setRewardName] = useState("")
    const [image, setImage] = useState(null)
    const [keepGallery, setKeepGallery] = useState([])
    const [newGallery, setNewGallery] = useState([])
    const [error, setError] = useState("")

    // small previews of the photos that were just chosen
    const newPreviews = useMemo(
        () => newGallery.map((file) => URL.createObjectURL(file)),
        [newGallery]
    )
    useEffect(() => {
        return () => newPreviews.forEach((url) => URL.revokeObjectURL(url))
    }, [newPreviews])

    const loadShop = () =>
        api
            .get("/shops/my")
            .then((res) => {
                setShop(res.data)
                setForm({
                    festival: res.data.festival?._id || "",
                    name: res.data.name || "",
                    category: res.data.category || "",
                    description: res.data.description || "",
                    locationNote: res.data.locationNote || "",
                })
                setStampRally(!!res.data.stampRally)
                setStampsNeeded(res.data.stampsNeeded || 3)
                setRewardName(res.data.rewardName || "")
                setKeepGallery(res.data.gallery || [])
                setNewGallery([])
            })
            .catch(() => setShop(null))
            .finally(() => setLoading(false))

    useEffect(() => {
        loadShop()
        api.get("/festivals").then((res) => setFestivals(res.data))
    }, [])

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const slotsLeft = MAX_GALLERY - keepGallery.length - newGallery.length

    const handleAddPhotos = (e) => {
        const files = Array.from(e.target.files)
        e.target.value = "" // lets the owner pick the same file again later

        if (files.length > slotsLeft) showToast(t("owner.photoLimit"))
        setNewGallery([...newGallery, ...files.slice(0, Math.max(0, slotsLeft))])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        try {
            const data = new FormData()
            Object.entries(form).forEach(([key, value]) => data.append(key, value))
            data.append("stampRally", stampRally)
            data.append("stampsNeeded", stampsNeeded)
            data.append("rewardName", rewardName)
            data.append("keepGallery", JSON.stringify(keepGallery))
            if (image) data.append("image", image)
            newGallery.forEach((file) => data.append("gallery", file))

            if (shop) await api.put("/shops/my", data)
            else await api.post("/shops", data)

            showToast(shop ? t("owner.updated") : t("owner.created"))
            setImage(null)
            loadShop()
        } catch (err) {
            setError(err.response?.data?.message || "Could not save stall")
        }
    }

    const handleDelete = async () => {
        if (!window.confirm(t("owner.confirmDelete", { name: shop.name }))) return

        try {
            await api.delete("/shops/my")
            showToast(t("owner.deleted"))

            // back to an empty "create your stall" form
            setShop(null)
            setForm(EMPTY_FORM)
            setStampRally(false)
            setStampsNeeded(3)
            setRewardName("")
            setImage(null)
            setKeepGallery([])
            setNewGallery([])
            setError("")
        } catch (err) {
            showToast(err.response?.data?.message || "Could not delete stall")
        }
    }

    if (loading) return <div className="container">{t("stalls.loading")}</div>

    return (
        <div className="container">
            <div className="section-title">
                <h2>{shop ? t("owner.editTitle") : t("owner.createTitle")}</h2>
            </div>

            <form className="panel inline-form" onSubmit={handleSubmit}>
                {error && <p className="error-text full">{error}</p>}

                <label className="full">
                    {t("owner.festival")}
                    <select name="festival" value={form.festival} onChange={handleChange} required>
                        <option value="">{t("owner.chooseFestival")}</option>
                        {festivals.map((f) => (
                            <option key={f._id} value={f._id}>
                                {f.name} ({f.place})
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    {t("owner.stallName")}
                    <input name="name" value={form.name} onChange={handleChange} required />
                </label>

                <label>
                    {t("owner.category")}
                    <input
                        name="category"
                        placeholder={t("owner.categoryHint")}
                        value={form.category}
                        onChange={handleChange}
                    />
                </label>

                <label className="full">
                    {t("owner.description")}
                    <textarea name="description" rows="3" value={form.description} onChange={handleChange} />
                </label>

                <label className="full">
                    {t("owner.mainPhoto")}
                    <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                </label>

                {/* location photos */}
                <div className="full">
                    <strong>📍 {t("owner.locationPhotos")}</strong>
                    <p className="muted" style={{ margin: "4px 0 10px" }}>{t("owner.locationPhotosHint")}</p>

                    <div className="photo-edit-row">
                        {keepGallery.map((url) => (
                            <div key={url} className="photo-edit">
                                <img src={url} alt="" />
                                <button
                                    type="button"
                                    title={t("owner.removePhoto")}
                                    onClick={() => setKeepGallery(keepGallery.filter((u) => u !== url))}
                                >
                                    ×
                                </button>
                            </div>
                        ))}

                        {newPreviews.map((url, i) => (
                            <div key={url} className="photo-edit is-new">
                                <img src={url} alt="" />
                                <button
                                    type="button"
                                    title={t("owner.removePhoto")}
                                    onClick={() => setNewGallery(newGallery.filter((_, idx) => idx !== i))}
                                >
                                    ×
                                </button>
                            </div>
                        ))}

                        {slotsLeft > 0 && (
                            <label className="photo-add">
                                <span>＋</span>
                                <small>{t("owner.addPhotos")}</small>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleAddPhotos}
                                    style={{ display: "none" }}
                                />
                            </label>
                        )}
                    </div>
                    <p className="muted" style={{ margin: "8px 0 0" }}>
                        {keepGallery.length + newGallery.length} / {MAX_GALLERY}
                    </p>
                </div>

                <label className="full">
                    {t("owner.locationNote")}
                    <input
                        name="locationNote"
                        maxLength="200"
                        placeholder={t("owner.locationNoteHint")}
                        value={form.locationNote}
                        onChange={handleChange}
                    />
                </label>

                <label
                    className="full"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: 14,
                        background: "var(--blush)",
                        borderRadius: 12,
                        cursor: "pointer",
                    }}
                >
                    <input
                        type="checkbox"
                        checked={stampRally}
                        onChange={(e) => setStampRally(e.target.checked)}
                        style={{ width: 22, height: 22, margin: 0 }}
                    />
                    <span>
                        🏅 <strong>{t("owner.stampRally")}</strong>
                        <br />
                        <span className="muted" style={{ fontWeight: 400 }}>{t("owner.stampRallyHint")}</span>
                    </span>
                </label>

                {stampRally && (
                    <>
                        <label>
                            {t("owner.stampsNeeded")}
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={stampsNeeded}
                                onChange={(e) => setStampsNeeded(e.target.value)}
                                required
                            />
                        </label>

                        <label>
                            {t("owner.rewardName")}
                            <input
                                value={rewardName}
                                placeholder={t("owner.rewardHint")}
                                onChange={(e) => setRewardName(e.target.value)}
                                required
                            />
                        </label>
                    </>
                )}

                <div className="full">
                    <button className="btn" type="submit">
                        {shop ? t("owner.save") : t("owner.create")}
                    </button>
                </div>
            </form>

            {shop && <RequestManager />}
            {shop && shop.stampRally && <CouponManager />}
            {shop && <SlotManager shop={shop} />}
            {shop && <MenuManager shop={shop} />}

            {shop && (
                <div className="danger-zone">
                    <h3>⚠ {t("owner.dangerTitle")}</h3>
                    <p className="muted">{t("owner.deleteHint")}</p>
                    <button className="btn danger" onClick={handleDelete}>
                        🗑 {t("owner.delete")}
                    </button>
                </div>
            )}
        </div>
    )
}