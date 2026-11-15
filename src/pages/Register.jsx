import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { useLang } from "../context/LanguageContext"

export default function Register() {
    const { register } = useAuth()
    const { showToast } = useToast()
    const { t } = useLang()
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" })
    const [image, setImage] = useState(null)
    const [error, setError] = useState("")

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        try {
            const formData = new FormData()
            Object.entries(form).forEach(([key, value]) => formData.append(key, value))
            if (image) formData.append("profileImage", image)

            const user = await register(formData)
            showToast(t("auth.created"))
            navigate("/")
        } catch (err) {
            setError(err.response?.data?.message || t("auth.registerFailed"))
        }
    }

    return (
        <form className="form-card" onSubmit={handleSubmit}>
            <h2>{t("auth.register")}</h2>
            {error && <p className="error-text">{error}</p>}

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
                <input name="password" type="password" value={form.password} onChange={handleChange} required />
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

            <button className="btn" type="submit">{t("auth.register")}</button>
            <p>
                {t("auth.haveAccount")} <Link to="/login">{t("auth.login")}</Link>
            </p>
        </form>
    )
}