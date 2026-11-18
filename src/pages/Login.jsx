import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { useLang } from "../context/LanguageContext"

export default function Login() {
    const { login } = useAuth()
    const { showToast } = useToast()
    const { t } = useLang()
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        try {
            const user = await login(email, password)
            showToast(t("auth.welcome", { name: user.name }))

            // the admin goes to the admin page, everyone else goes home
            if (user.role === "admin") navigate("/admin")
            else navigate("/")
        } catch (err) {
            setError(t("auth.loginFailed"))
        }
    }

    return (
        <form className="form-card" onSubmit={handleSubmit}>
            <h2>{t("auth.login")}</h2>
            {error && <p className="error-text">{error}</p>}

            <label>
                {t("auth.email")}
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>

            <label>
                {t("auth.password")}
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>

            <div className="pw-forgot">
                <Link to="/forgot">{t("pw.forgot")}</Link>
            </div>

            <button className="btn" type="submit">{t("auth.login")}</button>
            <p>
                {t("auth.noAccount")} <Link to="/register">{t("auth.register")}</Link>
            </p>
        </form>
    )
}
