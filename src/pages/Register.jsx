import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { useLang } from "../context/LanguageContext"

export default function Register() {
    const { register } = useAuth()
    const { showToast } = useToast()
    const ctx = useLang()
    const { t } = ctx
    const lang = ctx.lang || ctx.language || ctx.locale || "en"
    const navigate = useNavigate()

    const [step, setStep] = useState(1) // 1 = form, 2 = enter the emailed code
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" })
    const [image, setImage] = useState(null)
    const [code, setCode] = useState("")
    const [error, setError] = useState("")
    const [busy, setBusy] = useState(false)
    const [wait, setWait] = useState(0)

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    // countdown for the "resend" button
    useEffect(() => {
        if (wait <= 0) return
        const id = setTimeout(() => setWait((w) => w - 1), 1000)
        return () => clearTimeout(id)
    }, [wait])

    const sendCode = async () => {
        setError("")
        setBusy(true)
        try {
            await api.post("/auth/send-code", { email: form.email, lang })
            setStep(2)
            setCode("")
            setWait(60)
        } catch (err) {
            setError(err.response?.data?.message || t("pw.failed"))
        } finally {
            setBusy(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        // step 1: check the form, then email the code
        if (step === 1) {
            if (form.password.length < 6) {
                setError(t("pw.tooShort"))
                return
            }
            sendCode()
            return
        }

        // step 2: create the account with the code
        if (code.trim().length !== 6) {
            setError(t("pw.enterCode"))
            return
        }
        setBusy(true)
        try {
            const formData = new FormData()
            Object.entries(form).forEach(([key, value]) => formData.append(key, value))
            formData.append("code", code.trim())
            if (image) formData.append("profileImage", image)

            await register(formData)
            showToast(t("auth.created"))
            navigate("/")
        } catch (err) {
            setError(err.response?.data?.message || t("auth.registerFailed"))
        } finally {
            setBusy(false)
        }
    }

    return (
        <form className="form-card" onSubmit={handleSubmit}>
            <h2>{t("auth.register")}</h2>
            {error && <p className="error-text">{error}</p>}

            {step === 1 ? (
                <>
                    <label>
                        {t("auth.name")}
                        <input name="name" value={form.name} onChange={handleChange} required />
                    </label>

                    <label>
                        {t("auth.email")}
                        <input name="email" type="email" value={form.email} onChange={handleChange} required />
                    </label>

                    <label>
                        {t("auth.password")}
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            minLength={6}
                            required
                        />
                    </label>

                    <label>
                        {t("auth.iAm")}
                        <select name="role" value={form.role} onChange={handleChange}>
                            <option value="customer">{t("auth.visitor")}</option>
                            <option value="owner">{t("auth.owner")}</option>
                        </select>
                    </label>

                    <label>
                        {t("auth.photo")}
                        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                    </label>

                    <button className="btn" type="submit" disabled={busy}>
                        {busy ? t("pw.sending") : t("pw.sendCode")}
                    </button>
                </>
            ) : (
                <>
                    <p className="pw-info">{t("pw.codeSent", { email: form.email })}</p>

                    <input
                        className="pw-code"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="••••••"
                        aria-label={t("pw.code")}
                        autoFocus
                    />
                    <p className="muted pw-hint">{t("pw.codeHint")}</p>

                    <button className="btn" type="submit" disabled={busy}>
                        {busy ? t("pw.sending") : t("pw.verifyCreate")}
                    </button>

                    <div className="pw-links">
                        <button type="button" className="link-btn" onClick={() => setStep(1)}>
                            ← {t("pw.back")}
                        </button>
                        <button type="button" className="link-btn" onClick={sendCode} disabled={wait > 0 || busy}>
                            {wait > 0 ? t("pw.resendIn", { s: wait }) : t("pw.resend")}
                        </button>
                    </div>
                </>
            )}

            <p>
                {t("auth.haveAccount")} <Link to="/login">{t("auth.login")}</Link>
            </p>
        </form>
    )
}
