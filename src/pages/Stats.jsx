import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../api/axios"
import { useLang } from "../context/LanguageContext"
import Icon from "../components/Icon"
import TakoLoader from "../components/TakoLoader"

// a simple bar chart made with plain HTML and CSS
function BarChart({ data, labelKey }) {
    const max = Math.max(1, ...data.map((d) => d.count))

    return (
        <div className="bar-chart">
            {data.map((d) => (
                <div key={d[labelKey]} className="bar-col">
                    <span className="bar-value">{d.count}</span>
                    <div className="bar" style={{ height: `${(d.count / max) * 100}%` }} />
                    <span className="bar-label">{d[labelKey]}</span>
                </div>
            ))}
        </div>
    )
}

// empty state with the mascot
function Empty({ text }) {
    return (
        <div className="stats-empty">
            <img src="/mascot.png" alt="" />
            <p className="muted">{text}</p>
        </div>
    )
}

export default function Stats() {
    const { t } = useLang()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api
            .get("/stats/my")
            .then((res) => setStats(res.data))
            .catch(() => setStats(null))
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="container">
                <TakoLoader size={64} label={t("stalls.loading")} />
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="container">
                <div className="empty">{t("stats.noShop")}</div>
            </div>
        )
    }

    const statusOrder = ["pending", "approved", "completed", "noshow", "declined", "cancelled"]
    const totalForPercent = Math.max(1, stats.totalBookings)

    return (
        <div className="container">
            <div className="section-title">
                <h2><Icon name="chart" size={26} /> {t("stats.title")}</h2>
                <Link className="btn outline small" to="/owner">{t("ticket.back")}</Link>
            </div>

            <p className="muted">{stats.shopName}</p>

            {/* number cards */}
            <div className="stats">
                <div className="stat">
                    <strong>{stats.totalBookings}</strong>
                    <p>{t("stats.bookings")}</p>
                </div>
                <div className="stat">
                    <strong>{stats.checkedInVisitors}</strong>
                    <p>{t("stats.visitors")}</p>
                </div>
                <div className="stat">
                    <strong>{stats.byStatus.noshow}</strong>
                    <p>{t("stats.noshows")}</p>
                </div>
                <div className="stat">
                    <strong>¥{stats.orderIncome.toLocaleString()}</strong>
                    <p>{t("stats.income")}</p>
                </div>
            </div>

            <div className="stats">
                <div className="stat">
                    <strong>{stats.avgRating ? stats.avgRating.toFixed(1) : "-"}</strong>
                    <p>★ {t("stats.rating")} ({stats.reviewCount})</p>
                </div>
                <div className="stat">
                    <strong>{stats.stampRally ? stats.stampsGiven : "-"}</strong>
                    <p className="stat-label"><Icon name="medal" size={16} /> {t("stats.stamps")}</p>
                </div>
                <div className="stat">
                    <strong>{stats.stampRally ? stats.couponsMade : "-"}</strong>
                    <p className="stat-label"><Icon name="gift" size={16} /> {t("stats.couponsMade")}</p>
                </div>
                <div className="stat">
                    <strong>{stats.stampRally ? stats.couponsUsed : "-"}</strong>
                    <p>✓ {t("stats.couponsUsed")}</p>
                </div>
            </div>

            {/* chart 1: last 7 days */}
            <div className="panel">
                <h3>{t("stats.perDay")}</h3>
                <BarChart
                    data={stats.days.map((d) => ({ ...d, label: d.date.slice(5) }))}
                    labelKey="label"
                />
            </div>

            {/* chart 2: by time slot */}
            <div className="panel">
                <h3>{t("stats.perTime")}</h3>
                {stats.byTime.length === 0 ? (
                    <Empty text={t("stats.noData")} />
                ) : (
                    <BarChart data={stats.byTime} labelKey="time" />
                )}
            </div>

            {/* status breakdown */}
            <div className="panel">
                <h3>{t("stats.byStatus")}</h3>
                {statusOrder.map((s) => (
                    <div key={s} className="status-row">
                        <span className={`status ${s}`}>{t(`status.${s}`)}</span>
                        <div className="status-track">
                            <div
                                className="status-fill"
                                style={{ width: `${(stats.byStatus[s] / totalForPercent) * 100}%` }}
                            />
                        </div>
                        <strong>{stats.byStatus[s]}</strong>
                    </div>
                ))}
            </div>

            {/* popular dishes */}
            <div className="panel">
                <h3 className="stats-h3">
                    <img className="stats-h3-img" src="/mascot.png" alt="" /> {t("stats.dishes")}
                </h3>
                {stats.dishes.length === 0 ? (
                    <Empty text={t("stats.noDishes")} />
                ) : (
                    stats.dishes.map((d, i) => (
                        <div key={d.name} className="menu-item">
                            <span>
                                <strong>{i + 1}.</strong> {d.name}
                            </span>
                            <span className="price">× {d.quantity}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
