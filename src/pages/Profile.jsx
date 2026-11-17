import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"
import { useLang } from "../context/LanguageContext"
import StarRating from "../components/StarRating"

export default function Profile() {
    const { user, updateUser } = useAuth()
    const { t } = useLang()
    const [shop, setShop] = useState(null)
    const [reservations, setReservations] = useState([])

    // edit name and photo
    const [editing, setEditing] = useState(false)
    const [name, setName] = useState(user.name)
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState("")
    const [remove, setRemove] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [saved, setSaved] = useState(false)
    const fileRef = useRef(null)

    useEffect(() => {
        if (user.role === "owner") {
            api.get("/shops/my").then((res) => setShop(res.data)).catch(() => setShop(null))
        }
        if (user.role === "customer") {
            api.get("/reservations/my").then((res) => setReservations(res.data))
        }
    }, [user.role])

    const active = reservations.filter((r) => r.status === "pending" || r.status === "approved")

    const startEdit = () => {
        setName(user.name)
        setFile(null)
        setPreview("")
        setRemove(false)
        setError("")
        setSaved(false)
        setEditing(true)
    }

    const pickFile = (e) => {
        const f = e.target.files?.[0]
        if (!f) return
        if (!f.type.startsWith("image/")) {
            setError(t("pf.notImage"))
            return
        }
        setFile(f)
        setPreview(URL.createObjectURL(f))
        setRemove(false)
        setError("")
    }

    const removePhoto = () => {
        setFile(null)
        setPreview("")
        setRemove(true)
        if (fileRef.current) fileRef.current.value = ""
    }

    const save = async (e) => {
        e.preventDefault()
        if (!name.trim()) {
            setError(t("pf.nameEmpty"))
            return
        }
        setSaving(true)
        setError("")
        try {
            const fd = new FormData()
            fd.append("name", name.trim())
            if (file) fd.append("profileImage", file)
            if (remove && !file) fd.append("removeImage", "true")

            const { data } = await api.put("/auth/profile", fd)
            updateUser({ name: data.name, profileImage: data.profileImage })
            setEditing(false)
            setSaved(true)
        } catch (err) {
            setError(err.response?.data?.message || t("pf.failed"))
        } finally {
            setSaving(false)
        }
    }

    // photo shown in the circle
    const shownImage = editing ? (preview || (remove ? "" : user.profileImage)) : user.profileImage

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
                        flexShrink: 0,
                    }}
                >
                    {shownImage ? (
                        <img
                            src={shownImage}
                            alt={user.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (
                        (editing ? name : user.name)?.charAt(0).toUpperCase()
                    )}
                </div>

                {!editing ? (
                    <div>
                        <h1 style={{ margin: "0 0 6px", fontSize: 34, color: "var(--wine)" }}>{user.name}</h1>
                        <p className="muted" style={{ margin: 0 }}>{user.email}</p>
                        <span className="status approved" style={{ marginTop: 10 }}>
                            {t(`profile.role.${user.role}`)}
                        </span>
                        <div style={{ marginTop: 14 }}>
                            <button type="button" className="btn small outline" onClick={startEdit}>
                                {t("pf.edit")}
                            </button>
                            {saved && <span className="pf-ok">✓ {t("pf.saved")}</span>}
                        </div>
                    </div>
                ) : (
                    <form className="pf-form" onSubmit={save}>
                        <label>
                            {t("pf.name")}
                            <input
                                type="text"
                                value={name}
                                maxLength={40}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                        </label>

                        <div className="pf-photo-row">
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                onChange={pickFile}
                                style={{ display: "none" }}
                            />
                            <button type="button" className="btn small light" onClick={() => fileRef.current?.click()}>
                                {t("pf.changePhoto")}
                            </button>
                            {(shownImage || file) && (
                                <button type="button" className="btn small light" onClick={removePhoto}>
                                    {t("pf.removePhoto")}
                                </button>
                            )}
                        </div>

                        {error && <p className="pf-error">{error}</p>}

                        <div className="pf-actions">
                            <button className="btn small" type="submit" disabled={saving}>
                                {saving ? t("pf.saving") : t("pf.save")}
                            </button>
                            <button
                                className="btn small light"
                                type="button"
                                onClick={() => setEditing(false)}
                                disabled={saving}
                            >
                                {t("pf.cancel")}
                            </button>
                        </div>
                    </form>
                )}
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