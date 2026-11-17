import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useLang } from "../context/LanguageContext"
import useFavorites from "../utils/useFavorites"
import LanguageSwitcher from "./LanguageSwitcher"
import SeasonSwitcher from "./SeasonSwitcher"
import NotificationBell from "./NotificationBell"
import Icon from "./Icon"

export default function Navbar() {
    const { user, logout } = useAuth()
    const { t } = useLang()
    const { ids } = useFavorites()
    const [open, setOpen] = useState(false)
    const menuRef = useRef(null)

    useEffect(() => {
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    const handleLogout = () => {
        setOpen(false)
        logout()
    }

    return (
        <header className="navbar">
            <Link className="logo" to="/" aria-label="Yummy Go">
                <img className="logo-img" src="/logo.png" alt="Yummy Go" />
                <img className="logo-mark" src="/mascot.png" alt="Yummy Go" />
            </Link>

            <nav>
                <Link to="/">{t("nav.home")}</Link>
                <Link to="/stalls">{t("nav.stalls")}</Link>
                {user?.role === "customer" && <Link to="/my-reservations">{t("nav.myReservations")}</Link>}
                {user?.role === "customer" && (
                    <Link className="nav-ico" to="/stamps">
                        <Icon name="medal" size={16} /> {t("nav.stamps")}
                    </Link>
                )}
                {user?.role === "owner" && <Link to="/owner">{t("nav.owner")}</Link>}
                {user?.role === "admin" && <Link to="/admin">{t("nav.admin")}</Link>}

                {user?.role === "owner" && (
                    <Link className="nav-ico" to="/stats">
                        <Icon name="chart" size={16} /> {t("nav.stats")}
                    </Link>
                )}
            </nav>

            <div id="authNav">
                <Link to="/favorites" className="season-btn fav-link" title={t("fav.title")}>
                    <Icon name="heart" size={18} />
                    {ids.length > 0 && <em className="fav-count">{ids.length}</em>}
                </Link>
                <SeasonSwitcher />
                <LanguageSwitcher />

                {user && user.role !== "admin" && <NotificationBell />}

                {user ? (
                    <div className="user-menu" ref={menuRef}>
                        <button
                            className="avatar-btn"
                            onClick={() => setOpen(!open)}
                            aria-label={user.name}
                            title={user.name}
                        >
                            {user.profileImage ? (
                                <img src={user.profileImage} alt={user.name} />
                            ) : (
                                user.name?.charAt(0).toUpperCase()
                            )}
                        </button>

                        {open && (
                            <div className="user-dropdown">
                                <div className="user-info">
                                    <strong>{user.name}</strong>
                                    <span>{t(`profile.role.${user.role}`)}</span>
                                </div>
                                <Link to="/profile" onClick={() => setOpen(false)}>
                                    {t("nav.profile")}
                                </Link>
                                <button onClick={handleLogout}>{t("nav.logout")}</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <Link className="btn small" to="/login">{t("nav.login")}</Link>
                        <Link className="btn small outline" to="/register">{t("nav.register")}</Link>
                    </>
                )}
            </div>
        </header>
    )
}