import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { useLang } from "../context/LanguageContext"
import StarRating from "../components/StarRating"
import TakoLoader from "../components/TakoLoader"
import mapLink from "../utils/mapLink"
import { dateOnly, festivalRange, isEnded } from "../utils/festivalDates"

export default function ShopDetail() {
    const { id } = useParams()
    const { user } = useAuth()
    const { showToast } = useToast()
    const { t } = useLang()

    const [shop, setShop] = useState(null)
    const [menu, setMenu] = useState([])
    const [slots, setSlots] = useState([])
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)

    // reservation form
    const [mode, setMode] = useState("slot")
    const [slotId, setSlotId] = useState("")
    const [reqDate, setReqDate] = useState("")
    const [reqTime, setReqTime] = useState("")
    const [people, setPeople] = useState(1)
    const [note, setNote] = useState("")
    const [bookError, setBookError] = useState("")

    // popup after a successful booking
    const [success, setSuccess] = useState(null)

    // food pre-order: { menuItemId: quantity }
    const [cart, setCart] = useState({})

    // review form
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState("")
    const [reviewError, setReviewError] = useState("")

    // enlarged photo (location photo or food photo)
    const [zoomImg, setZoomImg] = useState("")

    const isCustomer = user?.role === "customer"

    const loadAll = async () => {
        const [s, m, sl, r] = await Promise.all([
            api.get(`/shops/${id}`),
            api.get(`/menu/shop/${id}`),
            api.get(`/slots/shop/${id}`),
            api.get(`/reviews/shop/${id}`),
        ])
        setShop(s.data)
        setMenu(m.data)
        setSlots(sl.data)
        setReviews(r.data)
    }

    useEffect(() => {
        loadAll()
            .catch(() => setShop(null))
            .finally(() => setLoading(false))
    }, [id])

    const changeQty = (itemId, delta) => {
        setCart((prev) => {
            const next = Math.max(0, Math.min(20, (prev[itemId] || 0) + delta))
            const copy = { ...prev }
            if (next === 0) delete copy[itemId]
            else copy[itemId] = next
            return copy
        })
    }

    // only items that are still available
    const cartLines = menu
        .filter((m) => m.available && cart[m._id])
        .map((m) => ({ ...m, quantity: cart[m._id] }))
    const orderTotal = cartLines.reduce((sum, m) => sum + m.price * m.quantity, 0)

    const orderItems = cartLines.map((m) => ({ menuItemId: m._id, quantity: m.quantity }))

    const handleReserve = async (e) => {
        e.preventDefault()
        setBookError("")

        try {
            let data
            let when = ""

            if (mode === "request") {
                if (!reqDate || !reqTime) return setBookError(t("shop.chooseDateTime"))

                const res = await api.post("/reservations/request", {
                    shopId: id,
                    date: reqDate,
                    time: reqTime,
                    people: Number(people),
                    note,
                    items: orderItems,
                })
                data = res.data
                when = `${reqDate} ${reqTime}`
            } else {
                if (!slotId) return setBookError(t("shop.chooseSlot"))

                const picked = slots.find((s) => s._id === slotId)
                const res = await api.post("/reservations", {
                    slotId,
                    people: Number(people),
                    note,
                    items: orderItems,
                })
                data = res.data
                when = picked ? `${picked.date} ${picked.time}` : ""
            }

            setSuccess({ code: data.code, shopName: shop.name, when })
            setSlotId("")
            setReqDate("")
            setReqTime("")
            setNote("")
            setCart({})
            loadAll()
        } catch (err) {
            setBookError(err.response?.data?.message || "Reservation failed")
        }
    }

    const handleReview = async (e) => {
        e.preventDefault()
        setReviewError("")

        try {
            await api.post("/reviews", { shopId: id, rating: Number(rating), comment })
            showToast(t("shop.reviewThanks"))
            setComment("")
            loadAll()
        } catch (err) {
            setReviewError(err.response?.data?.message || "Could not post review")
        }
    }

    if (loading)
        return (
            <div className="container">
                <TakoLoader size={64} label={t("stalls.loading")} />
            </div>
        )
    if (!shop) return <div className="container"><div className="empty">{t("shop.notFound")}</div></div>

    // the dates the visitor can ask for: inside the festival, and not in the past
    const today = new Date().toLocaleDateString("sv-SE")
    const festStart = dateOnly(shop.festival?.startDate)
    const festEnd = dateOnly(shop.festival?.endDate)
    const minDate = festStart && festStart > today ? festStart : today
    const maxDate = festEnd || ""
    const range = festivalRange(shop.festival)
    const ended = isEnded(shop.festival)

    return (
        <div className="container">
            <div className="detail-layout">
                {/* left column */}
                <div>
                    <div className="detail-image">
                        {shop.image ? <img src={shop.image} alt={shop.name} /> : "🍡"}
                    </div>

                    <div className="panel">
                        <h1 style={{ fontSize: 34, color: "var(--wine)" }}>{shop.name}</h1>
                        <p className="muted">
                            {shop.category} · {shop.festival?.name} ({shop.festival?.place})
                        </p>

                        {range && (
                            <p className="muted" style={{ margin: "0 0 8px" }}>
                                📅 {range}{" "}
                                {ended && <span className="status cancelled">{t("shop.festivalEnded")}</span>}
                            </p>
                        )}

                        {shop.festival?.mapLocation && (
                            <p>
                                <a
                                    className="btn light small"
                                    href={mapLink(shop.festival.mapLocation)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    📍 {t("shop.openMap")}
                                </a>
                            </p>
                        )}

                        {shop.stampRally && (
                            <p>
                                <span className="status approved">🏅 {t("shop.stampRally")}</span>
                                {shop.rewardName && (
                                    <span style={{ display: "block", marginTop: 6, color: "var(--wine)" }}>
                                        🎁 {t("shop.rewardLine", { n: shop.stampsNeeded, reward: shop.rewardName })}
                                    </span>
                                )}
                            </p>
                        )}

                        <p className="price">
                            <StarRating value={shop.avgRating} count={shop.reviewCount} />
                        </p>
                        <p>{shop.description}</p>
                    </div>

                    {/* how to find the stall */}
                    {(shop.gallery?.length > 0 || shop.locationNote) && (
                        <div className="panel">
                            <h2>📍 {t("shop.findUs")}</h2>
                            {shop.locationNote && <p>{shop.locationNote}</p>}

                            {shop.gallery?.length > 0 && (
                                <div className="gallery-grid">
                                    {shop.gallery.map((url) => (
                                        <img
                                            key={url}
                                            src={url}
                                            alt={t("shop.findUs")}
                                            onClick={() => setZoomImg(url)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="panel">
                        <h2>{t("shop.menu")}</h2>
                        {isCustomer && menu.length > 0 && <p className="muted">{t("order.hint")}</p>}

                        {menu.length === 0 ? (
                            <p className="muted">{t("shop.noMenu")}</p>
                        ) : (
                            menu.map((item) => (
                                <div key={item._id} className={`menu-item ${item.available ? "" : "sold-out"}`}>
                                    <div className="menu-main">
                                        <div
                                            className={`menu-thumb ${item.image ? "zoomable" : ""}`}
                                            onClick={() => item.image && setZoomImg(item.image)}
                                        >
                                            {item.image ? <img src={item.image} alt={item.name} /> : "🍡"}
                                        </div>
                                        <div>
                                            <strong>{item.name}</strong>
                                            {!item.available && ` ${t("shop.soldOut")}`}
                                            <div className="muted">{item.description}</div>
                                            <div className="price" style={{ margin: "2px 0 0" }}>
                                                ¥{item.price.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    {isCustomer && item.available && (
                                        <div className="qty">
                                            <button
                                                type="button"
                                                onClick={() => changeQty(item._id, -1)}
                                                disabled={!cart[item._id]}
                                                aria-label="-"
                                            >
                                                −
                                            </button>
                                            <span>{cart[item._id] || 0}</span>
                                            <button type="button" onClick={() => changeQty(item._id, 1)} aria-label="+">
                                                +
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="panel">
                        <h2>{t("shop.reviews")}</h2>
                        {reviews.length === 0 ? (
                            <p className="muted">{t("shop.noReviews")}</p>
                        ) : (
                            reviews.map((r) => (
                                <div key={r._id} className="review">
                                    <div className="review-head">
                                        <strong>{r.user?.name}</strong>
                                        <span className="stars">
                                            {"★".repeat(r.rating)}
                                            {"☆".repeat(5 - r.rating)}
                                        </span>
                                    </div>
                                    <div className="muted">{new Date(r.createdAt).toLocaleDateString()}</div>
                                    {r.comment && <p>{r.comment}</p>}
                                </div>
                            ))
                        )}

                        {isCustomer && (
                            <form onSubmit={handleReview} style={{ marginTop: 20 }}>
                                <h3>{t("shop.writeReview")}</h3>
                                {reviewError && <p className="error-text">{reviewError}</p>}

                                <label>
                                    {t("shop.rating")}
                                    <select value={rating} onChange={(e) => setRating(e.target.value)}>
                                        {[5, 4, 3, 2, 1].map((n) => (
                                            <option key={n} value={n}>
                                                {"★".repeat(n)} ({n})
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label>
                                    {t("shop.comment")}
                                    <textarea
                                        rows="3"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                </label>

                                <button className="btn" type="submit">{t("shop.postReview")}</button>
                                <p className="muted">{t("shop.reviewNote")}</p>
                            </form>
                        )}
                    </div>
                </div>

                {/* right column */}
                <div className="panel booking-card">
                    <h2>{t("shop.reserve")}</h2>

                    {!user && (
                        <p>
                            <Link to="/login"><strong>{t("auth.login")}</strong></Link> · {t("shop.pleaseLogin")}
                        </p>
                    )}
                    {user && !isCustomer && (
                        <p className="muted">{t("shop.onlyVisitors")}</p>
                    )}

                    {isCustomer && (
                        <form onSubmit={handleReserve}>
                            {bookError && <p className="error-text">{bookError}</p>}

                            {mode === "slot" ? (
                                <>
                                    {slots.length === 0 ? (
                                        <p className="muted">{t("shop.noSlots")}</p>
                                    ) : (
                                        <div className="slots">
                                            {slots.map((s) => (
                                                <button
                                                    type="button"
                                                    key={s._id}
                                                    className={`slot ${slotId === s._id ? "active" : ""}`}
                                                    disabled={s.full}
                                                    onClick={() => setSlotId(s._id)}
                                                >
                                                    {s.date}
                                                    <br />
                                                    {s.time}
                                                    <small>{s.full ? t("shop.full") : t("shop.left", { n: s.remaining })}</small>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {!ended && (
                                        <button
                                            type="button"
                                            className="link-btn"
                                            onClick={() => {
                                                setMode("request")
                                                setBookError("")
                                            }}
                                        >
                                            🕐 {t("shop.requestTime")}
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="request-box">
                                    <p className="muted" style={{ margin: "0 0 10px" }}>{t("shop.requestHint")}</p>
                                    {range && (
                                        <p style={{ margin: "0 0 10px" }}>
                                            📅 {t("shop.festivalDays", { range })}
                                        </p>
                                    )}

                                    <label>
                                        {t("shop.date")}
                                        <input
                                            type="date"
                                            value={reqDate}
                                            min={minDate}
                                            max={maxDate || undefined}
                                            onChange={(e) => setReqDate(e.target.value)}
                                            required
                                        />
                                    </label>

                                    <label>
                                        {t("shop.time")}
                                        <input
                                            type="time"
                                            value={reqTime}
                                            onChange={(e) => setReqTime(e.target.value)}
                                            required
                                        />
                                    </label>

                                    <button
                                        type="button"
                                        className="link-btn"
                                        onClick={() => {
                                            setMode("slot")
                                            setBookError("")
                                        }}
                                    >
                                        ← {t("shop.backToSlots")}
                                    </button>
                                </div>
                            )}

                            <label>
                                {t("shop.people")}
                                <input
                                    type="number"
                                    min="1"
                                    value={people}
                                    onChange={(e) => setPeople(e.target.value)}
                                    required
                                />
                            </label>

                            <div className="order-box" style={{ marginTop: 0, marginBottom: 15 }}>
                                <strong>🍡 {t("order.title")}</strong>

                                {cartLines.length === 0 ? (
                                    <p className="muted" style={{ margin: "6px 0 0" }}>{t("order.empty")}</p>
                                ) : (
                                    <>
                                        {cartLines.map((m) => (
                                            <div key={m._id} className="order-line">
                                                <span>{m.name} × {m.quantity}</span>
                                                <span>¥{(m.price * m.quantity).toLocaleString()}</span>
                                            </div>
                                        ))}
                                        <div className="order-total">
                                            {t("order.total")}: ¥{orderTotal.toLocaleString()}
                                        </div>
                                        <p className="muted" style={{ margin: "6px 0 0" }}>{t("order.payAtStall")}</p>
                                    </>
                                )}
                            </div>

                            <label>
                                {t("shop.note")}
                                <textarea rows="2" value={note} onChange={(e) => setNote(e.target.value)} />
                            </label>

                            <button className="btn" type="submit" style={{ width: "100%" }}>
                                {mode === "request" ? t("shop.sendRequest") : t("shop.send")}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* enlarged photo */}
            {zoomImg && (
                <div className="lightbox" onClick={() => setZoomImg("")}>
                    <img src={zoomImg} alt="" />
                </div>
            )}

            {/* booking sent */}
            {success && (
                <div className="success-overlay" onClick={() => setSuccess(null)}>
                    <div className="success-card" onClick={(e) => e.stopPropagation()}>
                        <div className="confetti" aria-hidden="true">
                            {Array.from({ length: 16 }).map((_, i) => (
                                <span key={i} style={{ "--i": i }}></span>
                            ))}
                        </div>

                        <svg className="success-check" viewBox="0 0 52 52">
                            <circle className="sc-circle" cx="26" cy="26" r="24" fill="none" />
                            <path className="sc-tick" fill="none" d="M14 27 l8 8 l16 -17" />
                        </svg>

                        <h2>{t("success.title")}</h2>
                        <p className="muted">
                            {success.shopName}
                            {success.when ? ` · ${success.when}` : ""}
                        </p>
                        {success.code && <p className="success-code">{success.code}</p>}
                        <p className="muted">{t("success.sub")}</p>

                        <div className="card-actions" style={{ justifyContent: "center", marginTop: 14 }}>
                            <Link className="btn" to="/my-reservations">{t("success.view")}</Link>
                            <button className="btn outline" type="button" onClick={() => setSuccess(null)}>
                                {t("success.close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}