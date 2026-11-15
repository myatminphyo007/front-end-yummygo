import { useState } from "react"
import api from "../api/axios"
import { useToast } from "../context/ToastContext"
import { useLang } from "../context/LanguageContext"

export default function CouponManager() {
    const { showToast } = useToast()
    const { t } = useLang()
    const [code, setCode] = useState("")
    const [coupon, setCoupon] = useState(null)
    const [notFound, setNotFound] = useState(false)

    const handleFind = async (e) => {
        e.preventDefault()
        setNotFound(false)
        setCoupon(null)

        if (!code.trim()) return

        try {
            const { data } = await api.get(`/reservations/coupon/${code.trim().toUpperCase()}`)
            setCoupon(data)
        } catch (err) {
            setNotFound(true)
        }
    }

    const handleUse = async () => {
        try {
            const { data } = await api.put(`/reservations/coupon/${coupon._id}/use`)
            showToast(t("coupon.usedDone"))
            setCoupon({ ...coupon, status: data.status, usedAt: data.usedAt })
        } catch (err) {
            showToast(err.response?.data?.message || "Could not use coupon")
        }
    }

    return (
        <>
            <div className="section-title" style={{ marginTop: 40 }}>
                <h2>🎁 {t("coupon.title")}</h2>
            </div>

            <form className="search-row" onSubmit={handleFind} style={{ margin: "0 0 20px" }}>
                <input
                    placeholder={t("coupon.placeholder")}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
                <button className="btn" type="submit">{t("coupon.find")}</button>
            </form>

            {notFound && <div className="empty">{t("coupon.notFound")}</div>}

            {coupon && (
                <div className="coupon-card">
                    <div className="coupon-code">{coupon.code.replace(/^FREE-/, "")}</div>
                    <p style={{ margin: "0 0 4px" }}>
                        <strong>{t("coupon.visitor")}:</strong> {coupon.user?.name}
                    </p>
                    <p style={{ margin: "0 0 12px" }}>
                        <strong>{t("coupon.reward")}:</strong> {coupon.rewardName}
                    </p>

                    <span className={`status ${coupon.status === "active" ? "approved" : "completed"}`}>
                        {coupon.status === "active" ? t("coupon.active") : t("coupon.used")}
                    </span>

                    {coupon.status === "active" && (
                        <div style={{ marginTop: 16 }}>
                            <button className="btn" onClick={handleUse}>
                                ✓ {t("coupon.use")}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}