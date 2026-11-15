import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import { useLang } from "../context/LanguageContext"

// "2 min ago" style text
const timeAgo = (dateString, t) => {
    const minutes = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000)
    if (minutes < 1) return t("noti.now")
    if (minutes < 60) return t("noti.minutes", { n: minutes })
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return t("noti.hours", { n: hours })
    return t("noti.days", { n: Math.floor(hours / 24) })
}

export default function NotificationBell() {
    const { t } = useLang()
    const navigate = useNavigate()
    const [list, setList] = useState([])
    const [unread, setUnread] = useState(0)
    const [open, setOpen] = useState(false)
    const boxRef = useRef(null)

    const load = () =>
        api
            .get("/notifications")
            .then((res) => {
                setList(res.data.list)
                setUnread(res.data.unread)
            })
            .catch(() => {})

    // check for new messages every 15 seconds
    useEffect(() => {
        load()
        const timer = setInterval(load, 15000)
        return () => clearInterval(timer)
    }, [])

    // close when clicking outside
    useEffect(() => {
        const handleClick = (e) => {
            if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    const openItem = async (n) => {
        setOpen(false)
        if (!n.read) {
            await api.put(`/notifications/${n._id}/read`).catch(() => {})
            load()
        }
        if (n.link) navigate(n.link)
    }

    const readAll = async () => {
        await api.put("/notifications/read-all")
        load()
    }

    const clearAll = async () => {
        await api.delete("/notifications")
        load()
    }

    return (
        <div className="bell" ref={boxRef}>
            <button
                className="bell-btn"
                onClick={() => setOpen(!open)}
                aria-label={t("noti.title")}
                title={t("noti.title")}
            >
                🔔
                {unread > 0 && <span className="bell-count">{unread > 9 ? "9+" : unread}</span>}
            </button>

            {open && (
                <div className="bell-panel">
                    <div className="bell-head">
                        <strong>{t("noti.title")}</strong>
                        <div>
                            {unread > 0 && (
                                <button onClick={readAll}>{t("noti.readAll")}</button>
                            )}
                            {list.length > 0 && (
                                <button onClick={clearAll}>{t("noti.clear")}</button>
                            )}
                        </div>
                    </div>

                    {list.length === 0 ? (
                        <p className="muted bell-empty">{t("noti.none")}</p>
                    ) : (
                        list.map((n) => (
                            <button
                                key={n._id}
                                className={`bell-item ${n.read ? "" : "unread"}`}
                                onClick={() => openItem(n)}
                            >
                                <span>{t(`noti.${n.type}`, n.data)}</span>
                                <small>{timeAgo(n.createdAt, t)}</small>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}