import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"
import { useLang } from "../context/LanguageContext"
import { useToast } from "../context/ToastContext"

import PetFace, { Pic } from "./PetFace"
import { adultSrc, artSrc, outfitSrc, thumbPos } from "../utils/petArt"

function Lock() {
    return (
        <svg className="pet-lock" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2.5" fill="currentColor" />
            <path d="M8 11 V8 a4 4 0 0 1 8 0 V11" fill="none" stroke="currentColor" strokeWidth="2.4" />
        </svg>
    )
}

export default function MascotPet({ compact = false }) {
    const { user } = useAuth()
    const { t } = useLang()
    const { showToast } = useToast()

    const [pet, setPet] = useState(null)
    const [nameInput, setNameInput] = useState("")
    const [renaming, setRenaming] = useState(false)
    const [saving, setSaving] = useState(false)
    const [queue, setQueue] = useState([]) // celebrations waiting to be shown

    useEffect(() => {
        api.get("/pet")
            .then((res) => {
                const p = res.data
                setPet(p)
                setNameInput(p.name)

                // the small card on the home page never uses up the celebrations
                if (compact) return

                try {
                    const id = user?._id || user?.id || "me"
                    const stageKey = `yg-pet-stage-${id}`
                    const outfitKey = `yg-pet-outfits-${id}`
                    const list = []

                    const seenStage = localStorage.getItem(stageKey)
                    if (seenStage !== null && p.stageIndex > Number(seenStage)) {
                        list.push({ kind: "stage" })
                    }

                    const seenOutfits = JSON.parse(localStorage.getItem(outfitKey) || "null")
                    if (Array.isArray(seenOutfits)) {
                        p.unlockedKeys
                            .filter((k) => !seenOutfits.includes(k))
                            .forEach((k) => list.push({ kind: "outfit", key: k }))
                    }

                    localStorage.setItem(stageKey, String(p.stageIndex))
                    localStorage.setItem(outfitKey, JSON.stringify(p.unlockedKeys))
                    setQueue(list)
                } catch {
                    /* private mode: no celebration */
                }
            })
            .catch(() => {})
    }, [])

    if (!pet) return null

    const stageName = (key) => t(`pet.stage.${key}`)
    const isAdult = pet.stage === "adult"
    const needsChoice = isAdult && !pet.gender
    const canWear = isAdult && !!pet.gender
    const unlockedCount = pet.unlockedKeys.length

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

    // progress: to the next stage, and after that, outfits collected
    let goalText
    let percent
    if (pet.next) {
        const left = pet.next.at - pet.stamps
        percent = Math.max(4, Math.min(100, Math.round((pet.stamps / pet.next.at) * 100)))
        goalText = t("pet.nextStage", { n: left, stage: stageName(pet.next.key) })
    } else {
        percent = Math.max(4, Math.round((unlockedCount / pet.outfits.length) * 100))
        goalText = t("pet.collected", { n: unlockedCount, total: pet.outfits.length })
    }

    /* ---------- small card (home page) ---------- */
    if (compact) {
        return (
            <Link to="/stamps" className="pet-mini">
                <div className="pet-mini-art">
                    <Pic src={artSrc(pet)} />
                </div>
                <div className="pet-mini-body">
                    <strong>{pet.name || t("pet.nameAsk")}</strong>
                    <span className="muted">
                        {needsChoice ? t("pet.chooseTitle") : `${stageName(pet.stage)} · ${t("pet.stamps", { n: pet.stamps })}`}
                    </span>
                    <div className="pet-bar"><i style={{ width: `${percent}%` }} /></div>
                </div>
                <span className="btn small">{t("pet.open")}</span>
            </Link>
        )
    }

    /* ---------- full card (stamp page) ---------- */
    const asking = !pet.name || renaming
    let sayKey = isAdult ? `pet.say.adult.${pet.gender || "boy"}` : `pet.say.${pet.stage}`
    if (pet.mood === "sleepy") sayKey = "pet.say.sleepy"
    if (pet.mood === "happy") sayKey = "pet.say.happy"
    const popup = queue[0]

    return (
        <div className="panel pet-card">
            <div className="pet-head">
                <h3>{t("pet.title")}</h3>
                <span className="muted">{t("pet.stamps", { n: pet.stamps })}</span>
            </div>

            <div className="pet-stage">
                <div className={`pet-art ${pet.mood === "sleepy" ? "sleepy" : ""} ${pet.mood === "happy" ? "happy" : ""}`}>
                    <Pic src={artSrc(pet)} />
                    {pet.mood === "sleepy" && <b className="pet-zzz" aria-hidden="true">Z z z</b>}
                    {pet.mood === "happy" && <b className="pet-spark" aria-hidden="true">✦ ✦</b>}
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
                                {pet.mood !== "normal" && (
                                    <span className={`pet-badge mood-${pet.mood}`}>{t(`pet.mood.${pet.mood}`)}</span>
                                )}
                                <button type="button" className="link-btn" onClick={() => setRenaming(true)}>
                                    {t("pet.rename")}
                                </button>
                            </div>
                            <div className="pet-say">{t(sayKey, { name: pet.name })}</div>
                        </>
                    )}

                    <div className="pet-goal">{goalText}</div>
                    <div className="pet-bar"><i style={{ width: `${percent}%` }} /></div>

                    {/* boy or girl: can be changed any time once grown up */}
                    {isAdult && pet.gender && (
                        <div className="pet-seg" role="group">
                            {["boy", "girl"].map((g) => (
                                <button
                                    key={g}
                                    type="button"
                                    className={pet.gender === g ? "on" : ""}
                                    aria-pressed={pet.gender === g}
                                    onClick={() => pet.gender !== g && save({ gender: g })}
                                >
                                    {t(`pet.${g}`)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* grown up: boy or girl? */}
            {needsChoice && (
                <div className="pet-choose">
                    <strong>{t("pet.chooseTitle")}</strong>
                    <p className="muted">{t("pet.chooseHint")}</p>
                    <div className="pet-choose-row">
                        {["boy", "girl"].map((g) => (
                            <button
                                key={g}
                                type="button"
                                className="pet-choice"
                                disabled={saving}
                                onClick={() => save({ gender: g })}
                            >
                                <span className="pet-choice-img"><Pic src={adultSrc(g)} /></span>
                                <strong>{t(`pet.${g}`)}</strong>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="pet-wardrobe">
                <strong>{t("pet.wardrobe")}</strong>
                <div className="pet-outfits">
                    <button
                        type="button"
                        className={`pet-o ${pet.outfit === "" ? "on" : ""}`}
                        onClick={() => pet.outfit !== "" && save({ outfit: "" })}
                        aria-pressed={pet.outfit === ""}
                    >
                        <span className="pet-o-img">
                            <Pic src={artSrc(pet, false)} />
                        </span>
                        <small>{t("pet.plain")}</small>
                    </button>

                    {pet.outfits.map((o) => {
                        const on = pet.outfit === o.key
                        return (
                            <button
                                key={o.key}
                                type="button"
                                className={`pet-o ${on ? "on" : ""} ${o.unlocked ? "" : "locked"}`}
                                onClick={() => o.unlocked && canWear && !on && save({ outfit: o.key })}
                                aria-pressed={on}
                            >
                                <span className="pet-o-img">
                                    <Pic
                                        src={outfitSrc(o.key, pet.gender)}
                                        pos={thumbPos(o.key, pet.gender)}
                                    />
                                    {!o.unlocked && <Lock />}
                                </span>
                                <small>{t(`pet.o.${o.key}`)}</small>
                                {o.unlocked ? (
                                    !canWear && (
                                        <small className="muted">
                                            {isAdult ? t("pet.chooseTitle") : t("pet.needAdult")}
                                        </small>
                                    )
                                ) : (
                                    <>
                                        <small className="muted">{t(`pet.goal.${o.key}`, { n: o.need })}</small>
                                        <small className="pet-prog">{o.have} / {o.need}</small>
                                    </>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* celebration: the mascot grew, or a new outfit was unlocked */}
            {popup && (
                <div className="success-overlay" onClick={() => setQueue((q) => q.slice(1))}>
                    <div className="success-card" onClick={(e) => e.stopPropagation()}>
                        <div className="confetti" aria-hidden="true">
                            {Array.from({ length: 16 }).map((_, i) => (
                                <span key={i} style={{ "--i": i }}></span>
                            ))}
                        </div>
                        <div className="pet-art pet-pop">
                            <Pic
                                src={popup.kind === "outfit" ? outfitSrc(popup.key, pet.gender) : artSrc(pet, false)}
                                pos={popup.kind === "outfit" ? thumbPos(popup.key, pet.gender) : undefined}
                            />
                        </div>
                        <h2>
                            {popup.kind === "outfit"
                                ? t("pet.newOutfit", { outfit: t(`pet.o.${popup.key}`) })
                                : t("pet.grew", { name: pet.name || t("pet.title"), stage: stageName(pet.stage) })}
                        </h2>
                        <div className="card-actions" style={{ justifyContent: "center", marginTop: 14 }}>
                            <button className="btn" type="button" onClick={() => setQueue((q) => q.slice(1))}>
                                {t("success.close")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
