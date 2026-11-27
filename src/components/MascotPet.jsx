import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"
import { useLang } from "../context/LanguageContext"
import { useToast } from "../context/ToastContext"

// where to crop each season picture so the face sits in the circle
const FACE_POS = {
    spring: "50% 16%",
    summer: "50% 10%",
    autumn: "50% 22%",
    winter: "50% 14%",
}

function Egg() {
    return (
        <svg className="pet-egg" viewBox="0 0 120 120" aria-hidden="true">
            <ellipse cx="60" cy="108" rx="26" ry="4" fill="#000" opacity="0.08" />
            <ellipse cx="60" cy="66" rx="30" ry="40" fill="#FAEEDA" stroke="#EF9F27" strokeWidth="2.5" />
            <circle cx="48" cy="52" r="5" fill="#F5C4B3" />
            <circle cx="72" cy="70" r="6" fill="#F5C4B3" />
            <circle cx="52" cy="86" r="4" fill="#F5C4B3" />
            <circle cx="70" cy="46" r="3.5" fill="#F5C4B3" />
        </svg>
    )
}

function Baby() {
    return (
        <div className="pet-baby">
            <img src="/mascot.png" alt="" />
            <svg viewBox="0 0 116 46" aria-hidden="true">
                <path
                    d="M4 6 L17 16 L30 4 L43 16 L56 4 L69 16 L82 4 L95 16 L112 6 L108 28 Q58 56 8 28 Z"
                    fill="#FAEEDA"
                    stroke="#EF9F27"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    )
}

function Lock() {
    return (
        <svg className="pet-lock" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2.5" fill="currentColor" />
            <path d="M8 11 V8 a4 4 0 0 1 8 0 V11" fill="none" stroke="currentColor" strokeWidth="2.4" />
        </svg>
    )
}

// the picture of the mascot for its stage (or its outfit)
function PetArt({ pet }) {
    if (pet.outfit) {
        return <img className="pet-outfit-img" src={`/mascots/${pet.outfit}.webp`} alt="" />
    }
    if (pet.stage === "egg") return <Egg />
    if (pet.stage === "baby") return <Baby />
    return <img className={`pet-grow pet-${pet.stage}`} src="/mascot.png" alt="" />
}

export default function MascotPet({ compact = false }) {
    const { user } = useAuth()
    const { t } = useLang()
    const { showToast } = useToast()

    const [pet, setPet] = useState(null)
    const [nameInput, setNameInput] = useState("")
    const [renaming, setRenaming] = useState(false)
    const [saving, setSaving] = useState(false)
    const [grew, setGrew] = useState("")

    useEffect(() => {
        api.get("/pet")
            .then((res) => {
                const p = res.data
                setPet(p)
                setNameInput(p.name)

                // celebrate when the mascot reached a new stage since the last visit
                try {
                    const key = `yg-pet-stage-${user?._id || user?.id || "me"}`
                    const seen = localStorage.getItem(key)
                    if (seen !== null && p.stageIndex > Number(seen)) setGrew(p.stage)
                    localStorage.setItem(key, String(p.stageIndex))
                } catch {
                    /* private mode: no celebration */
                }
            })
            .catch(() => {})
    }, [])

    if (!pet) return null

    const stageName = (key) => t(`pet.stage.${key}`)
    const petName = pet.name || t("pet.title")

    const save = async (body, okText) => {
        setSaving(true)
        try {
            const res = await api.put("/pet", body)
            setPet(res.data)
            setNameInput(res.data.name)
            setRenaming(false)
            if (okText) showToast(okText)
        } catch (err) {
            showToast(err.response?.data?.message || "Could not save")
        } finally {
            setSaving(false)
        }
    }

    const saveName = (e) => {
        e.preventDefault()
        if (!nameInput.trim()) return
        save({ name: nameInput }, t("pet.saved"))
    }

    // progress to the next goal
    let goalText = t("pet.maxed")
    let percent = 100
    if (pet.next) {
        const left = pet.next.at - pet.stamps
        percent = Math.max(4, Math.min(100, Math.round((pet.stamps / pet.next.at) * 100)))
        goalText =
            pet.next.type === "stage"
                ? t("pet.nextStage", { n: left, stage: stageName(pet.next.key) })
                : t("pet.nextOutfit", { n: left, outfit: t(`pet.o.${pet.next.key}`) })
    }

    /* ---------- small card (home page) ---------- */
    if (compact) {
        return (
            <Link to="/stamps" className="pet-mini">
                <div className="pet-mini-art">
                    <PetArt pet={pet} />
                </div>
                <div className="pet-mini-body">
                    <strong>{pet.name || t("pet.nameAsk")}</strong>
                    <span className="muted">
                        {stageName(pet.stage)} · {t("pet.stamps", { n: pet.stamps })}
                    </span>
                    <div className="pet-bar"><i style={{ width: `${percent}%` }} /></div>
                </div>
                <span className="btn small">{t("pet.open")}</span>
            </Link>
        )
    }

    /* ---------- full card (stamp page) ---------- */
    const asking = !pet.name || renaming

    return (
        <div className="panel pet-card">
            <div className="pet-head">
                <h3>{t("pet.title")}</h3>
                <span className="muted">{t("pet.stamps", { n: pet.stamps })}</span>
            </div>

            <div className="pet-stage">
                <div className={`pet-art ${pet.outfit ? "has-outfit" : ""}`}>
                    <PetArt pet={pet} />
                </div>

                <div className="pet-info">
                    {asking ? (
                        <form onSubmit={saveName} className="pet-name-form">
                            <label>
                                {t("pet.nameAsk")}
                                <input
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    placeholder={t("pet.namePlaceholder")}
                                    maxLength={12}
                                    autoFocus={renaming}
                                />
                            </label>
                            <button className="btn small" type="submit" disabled={saving || !nameInput.trim()}>
                                {t("pet.save")}
                            </button>
                        </form>
                    ) : (
                        <>
                            <div className="pet-name-row">
                                <strong className="pet-name">{pet.name}</strong>
                                <span className="pet-badge">{stageName(pet.stage)}</span>
                                <button type="button" className="link-btn" onClick={() => setRenaming(true)}>
                                    {t("pet.rename")}
                                </button>
                            </div>
                            <div className="pet-say">{t(`pet.say.${pet.stage}`, { name: pet.name })}</div>
                        </>
                    )}

                    <div className="pet-goal">{goalText}</div>
                    <div className="pet-bar"><i style={{ width: `${percent}%` }} /></div>
                </div>
            </div>

            <div className="pet-wardrobe">
                <strong>{t("pet.wardrobe")}</strong>
                <div className="pet-outfits">
                    <button
                        type="button"
                        className={`pet-o ${pet.outfit === "" ? "on" : ""}`}
                        onClick={() => pet.outfit !== "" && save({ outfit: "" })}
                        aria-pressed={pet.outfit === ""}
                    >
                        <span className="pet-o-img plain">
                            <img src="/mascot.png" alt="" />
                        </span>
                        <small>{t("pet.plain")}</small>
                    </button>

                    {pet.outfits.map((o) => {
                        const open = pet.unlocked.includes(o.key)
                        const on = pet.outfit === o.key
                        return (
                            <button
                                key={o.key}
                                type="button"
                                className={`pet-o ${on ? "on" : ""} ${open ? "" : "locked"}`}
                                onClick={() => open && !on && save({ outfit: o.key })}
                                aria-pressed={on}
                            >
                                <span className="pet-o-img">
                                    <img
                                        src={`/mascots/${o.key}.webp`}
                                        alt=""
                                        style={{ objectPosition: FACE_POS[o.key] }}
                                    />
                                    {!open && <Lock />}
                                </span>
                                <small>{t(`pet.o.${o.key}`)}</small>
                                {!open && <small className="muted">{t("pet.locked", { n: o.from })}</small>}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* growth celebration */}
            {grew && (
                <div className="success-overlay" onClick={() => setGrew("")}>
                    <div className="success-card" onClick={(e) => e.stopPropagation()}>
                        <div className="confetti" aria-hidden="true">
                            {Array.from({ length: 16 }).map((_, i) => (
                                <span key={i} style={{ "--i": i }}></span>
                            ))}
                        </div>
                        <div className="pet-art pet-pop">
                            <PetArt pet={{ ...pet, outfit: "" }} />
                        </div>
                        <h2>{t("pet.grew", { name: petName, stage: stageName(grew) })}</h2>
                        <div className="card-actions" style={{ justifyContent: "center", marginTop: 14 }}>
                            <button className="btn" type="button" onClick={() => setGrew("")}>
                                {t("success.close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
