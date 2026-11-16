import { useEffect, useState } from "react"
import { useLang } from "../context/LanguageContext"
import TakoLoader from "./TakoLoader"

export default function WakeBanner() {
    const { t } = useLang()
    const [show, setShow] = useState(false)
    const [sec, setSec] = useState(0)

    useEffect(() => {
        const slow = () => {
            setSec(3)
            setShow(true)
        }
        const idle = () => setShow(false)

        window.addEventListener("api:slow", slow)
        window.addEventListener("api:idle", idle)
        return () => {
            window.removeEventListener("api:slow", slow)
            window.removeEventListener("api:idle", idle)
        }
    }, [])

    useEffect(() => {
        if (!show) return
        const id = setInterval(() => setSec((s) => s + 1), 1000)
        return () => clearInterval(id)
    }, [show])

    if (!show) return null

    return (
        <div className="wake-banner" role="status">
            <TakoLoader size={34} />
            <div>
                <strong>{t("wake.title")}</strong>
                <span>{t("wake.text")} ({sec}s)</span>
            </div>
        </div>
    )
}