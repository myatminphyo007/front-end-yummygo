import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../api/axios"
import { useToast } from "../context/ToastContext"
import { useLang } from "../context/LanguageContext"

export default function ForgotPassword() {
    const { showToast } = useToast()
    const ctx = useLang()
    const { t } = ctx
    const lang = ctx.lang || ctx.language || ctx.locale || "en"
    const navigate = useNavigate()

    const [step, setStep] = useState(1) // 1 = email, 2 = code + new password
    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")
    const [pass, setPass] = useState("")
    const [pass2, setPass2] = useState("")
    const [error, setError] = useState("")
    const [busy, setBusy] = useState(false)
    const [wait, setWait] = useState(0)

    useEffect(() => {
        if (wait <= 0) return
        const id = setTimeout(() => setWait((w) => w - 1), 1000)
        return () => clearTimeout(id)
    }, [wait])

    const sendCode = async () => {
        setError("")
        setBusy(true)
        try {
            await api.post("/auth/forgot", { email, lang })
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

        if (step === 1) {
            sendCode()
            return
        }

        if (code.trim().length !== 6) return setError(t("pw.enterCode"))
        if (pass.length < 6) return setError(t("pw.tooShort"))
        if (pass !== pass2) return setError(t("pw.mismatch"))

        setBusy(true)
        try {
            await api.post("/auth/reset", { email, code: code.trim(), newPassword: pass })
            showToast(t("pw.resetDone"))
            navigate("/login")
        } catch (err) {
            setError(err.response?.data?.message || t("pw.failed"))
        } finally {
            setBusy(false)
        }
    }

    return (
        <form className="form-card" onSubmit={handleSubmit}>
            <h2>{t("pw.forgotTitle")}</h2>
            {error && <p className="error-text">{error}</p>}

            {step === 1 ? (
                <>
                    <p className="pw-info">{t("pw.forgotDesc")}</p>
                    <label>
                        {t("auth.email")}
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </label>
                    <button className="btn" type="submit" disabled={busy}>
                        {busy ? t("pw.sending") : t("pw.sendCode")}
                    </button>
                </>
            ) : (
                <>
                    <p className="pw-info">{t("pw.codeSent", { email })}</p>

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

                    <label>
                        {t("pw.newPass")}
                        <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} minLength={6} required />
                    </label>
                    <label>
                        {t("pw.confirmPass")}
                        <input type="password" value={pass2} onChange={(e) => setPass2(e.target.value)} minLength={6} required />
                    </label>

                    <button className="btn" type="submit" disabled={busy}>
                        {busy ? t("pw.sending") : t("pw.resetBtn")}
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
                <Link to="/login">{t("pw.backLogin")}</Link>
            </p>
        </form>
    )
}
