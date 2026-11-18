import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"
import { useLang } from "../context/LanguageContext"
import { useToast } from "../context/ToastContext"
import StarRating from "../components/StarRating"
import Icon from "../components/Icon"

export default function Profile() {
    const { user, updateUser } = useAuth()
    const ctx = useLang()
    const { t } = ctx
    const lang = ctx.lang || ctx.language || ctx.locale || "en"
    const { showToast } = useToast()
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

    // change password (needs a code sent to my email)
    const [pwOpen, setPwOpen] = useState(false)
    const [pwSent, setPwSent] = useState(false)
    const [pwCode, setPwCode] = useState("")
    const [pwCur, setPwCur] = useState("")
    const [pwForgot, setPwForgot] = useState(false) // forgot the current password
    const [pwNew, setPwNew] = useState("")
    const [pwNew2, setPwNew2] = useState("")
    const [pwBusy, setPwBusy] = useState(false)
    const [pwErr, setPwErr] = useState("")
    const [pwWait, setPwWait] = useState(0)

    useEffect(() => {
        if (pwWait <= 0) return
        const id = setTimeout(() => setPwWait((w) => w - 1), 1000)
        return () => clearTimeout(id)
    }, [pwWait])

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

    const closePw = () => {
        setPwOpen(false)
        setPwSent(false)
        setPwCode("")
        setPwCur("")
        setPwForgot(false)
        setPwNew("")
        setPwNew2("")
        setPwErr("")
    }

    const sendPwCode = async () => {
        setPwErr("")
        setPwBusy(true)
        try {
            await api.post("/auth/password/send-code", { lang })
            setPwSent(true)
            setPwWait(60)
        } catch (err) {
            setPwErr(err.response?.data?.message || t("pw.failed"))
        } finally {
            setPwBusy(false)
        }
    }

    const changePw = async (e) => {
        e.preventDefault()
        setPwErr("")
        if (pwCode.trim().length !== 6) return setPwErr(t("pw.enterCode"))
        if (pwNew.length < 6) return setPwErr(t("pw.tooShort"))
        if (pwNew !== pwNew2) return setPwErr(t("pw.mismatch"))

        setPwBusy(true)
        try {
            await api.put("/auth/password", {
                currentPassword: pwForgot ? "" : pwCur,
                forgotCurrent: pwForgot,
                code: pwCode.trim(),
                newPassword: pwNew
            })
            showToast(t("pw.changed"))
            closePw()
        } catch (err) {
            setPwErr(err.response?.data?.message || t("pw.failed"))
        } finally {
            setPwBusy(false)
        }
    }

    // photo shown in the circle
    const shownImage = editing ? preview || (remove ? "" : user.profileImage) : user.profileImage
    const letter = (editing ? name : user.name)?.charAt(0).toUpperCase()

    return (
        <div className="container">
            {/* top card: same for everyone */}
            <div className={`panel pe-card ${editing ? "editing" : ""}`}>
                <div className="pe-avatar">
                    <div className="pe-circle">
                        {shownImage ? <img src={shownImage} alt={user.name} /> : letter}
                    </div>
                    {editing && (
                        <button
                            type="button"
                            className="pe-cam"
                            title={t("pf.changePhoto")}
                            aria-label={t("pf.changePhoto")}
                            onClick={() => fileRef.current?.click()}
                        >
                            <Icon name="camera" size={18} />
                        </button>
                    )}
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={pickFile}
                        style={{ display: "none" }}
                    />
                </div>

                {!editing ? (
                    <div>
                        <h1 style={{ margin: "0 0 6px", fontSize: 34, color: "var(--wine)" }}>{user.name}</h1>
                        <p className="muted" style={{ margin: 0 }}>{user.email}</p>
                        <span className="status approved" style={{ marginTop: 10 }}>
                            {t(`profile.role.${user.role}`)}
                        </span>
                        <div style={{ marginTop: 16 }}>
                            <button type="button" className="pe-btn ghost small" onClick={startEdit}>
                                <Icon name="edit" size={15} /> {t("pf.edit")}
                            </button>
                            {saved && <span className="pe-ok">✓ {t("pf.saved")}</span>}
                        </div>
                    </div>
                ) : (
                    <form className="pe-form" onSubmit={save}>
                        <label className="pe-label" htmlFor="pe-name">{t("pf.name")}</label>
                        <div className="pe-field">
                            <input
                                id="pe-name"
                                type="text"
                                value={name}
                                maxLength={40}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                            <span className="pe-count">{name.length}/40</span>
                        </div>

                        {shownImage && (
                            <button type="button" className="pe-link" onClick={removePhoto}>
                                {t("pf.removePhoto")}
                            </button>
                        )}

                        {error && <p className="pe-error">{error}</p>}

                        <div className="pe-actions">
                            <button className="pe-btn" type="submit" disabled={saving}>
                                {saving ? t("pf.saving") : t("pf.save")}
                            </button>
                            <button
                                className="pe-btn ghost"
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

            {/* change password: all roles */}
            <div className="panel pw-panel">
                <h2>{t("pw.change")}</h2>
                {!pwOpen ? (
                    <button type="button" className="pe-btn ghost small" onClick={() => setPwOpen(true)}>
                        {t("pw.change")}
                    </button>
                ) : (
                    <form onSubmit={changePw} className="pw-form">
                        {pwErr && <p className="error-text">{pwErr}</p>}

                        {!pwSent ? (
                            <>
                                <p className="muted">{t("pw.codeSent", { email: user.email })}</p>
                                <div className="pe-actions">
                                    <button type="button" className="pe-btn" onClick={sendPwCode} disabled={pwBusy}>
                                        {pwBusy ? t("pw.sending") : t("pw.sendMyCode")}
                                    </button>
                                    <button type="button" className="pe-btn ghost" onClick={closePw}>
                                        {t("pf.cancel")}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <input
                                    className="pw-code"
                                    value={pwCode}
                                    onChange={(e) => setPwCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    placeholder="••••••"
                                    aria-label={t("pw.code")}
                                    autoFocus
                                />
                                <p className="muted pw-hint">{t("pw.codeHint")}</p>

                                {!pwForgot && (
                                    <label>
                                        {t("pw.current")}
                                        <input type="password" value={pwCur} onChange={(e) => setPwCur(e.target.value)} required />
                                    </label>
                                )}
                                <button type="button" className="link-btn" onClick={() => setPwForgot((v) => !v)}>
                                    {pwForgot ? t("pw.haveCurrent") : t("pw.forgotCurrent")}
                                </button>
                                <label>
                                    {t("pw.newPass")}
                                    <input type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} minLength={6} required />
                                </label>
                                <label>
                                    {t("pw.confirmPass")}
                                    <input type="password" value={pwNew2} onChange={(e) => setPwNew2(e.target.value)} minLength={6} required />
                                </label>

                                <div className="pe-actions">
                                    <button className="pe-btn" type="submit" disabled={pwBusy}>
                                        {pwBusy ? t("pw.sending") : t("pw.changeBtn")}
                                    </button>
                                    <button type="button" className="pe-btn ghost" onClick={closePw} disabled={pwBusy}>
                                        {t("pf.cancel")}
                                    </button>
                                </div>
                                <button type="button" className="link-btn" onClick={sendPwCode} disabled={pwWait > 0 || pwBusy}>
                                    {pwWait > 0 ? t("pw.resendIn", { s: pwWait }) : t("pw.resend")}
                                </button>
                            </>
                        )}
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