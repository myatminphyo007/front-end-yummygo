import { ADULT_BOY, artSrc, thumbPos } from "../utils/petArt"

// a picture that fills its box (shared by the big mascot and the small faces)
export function Pic({ src, pos = "50% 30%" }) {
    const logo = src === ADULT_BOY
    return (
        <img
            className={`pet-pic ${logo ? "logo" : ""}`}
            src={src}
            alt=""
            style={logo ? undefined : { objectPosition: pos }}
        />
    )
}

// a small round face of somebody's mascot, with its mood
// look = { stage, gender, outfit, mood }
export default function PetFace({ look, size = 40 }) {
    if (!look) return null

    const sleepy = look.mood === "sleepy"
    const happy = look.mood === "happy"
    const pos = look.outfit ? thumbPos(look.outfit, look.gender) : "50% 30%"

    return (
        <span
            className={`pet-face ${sleepy ? "sleepy" : ""} ${happy ? "happy" : ""}`}
            style={{ width: size, height: size }}
            title={look.name || ""}
        >
            <span className="pet-face-img">
                <Pic src={artSrc(look)} pos={pos} />
            </span>
            {sleepy && <b className="pet-zzz" aria-hidden="true">z</b>}
            {happy && <b className="pet-spark" aria-hidden="true">✦</b>}
        </span>
    )
}

// the visitor's own profile photo (a round letter if there is none)
export function Avatar({ src, name = "", size = 36 }) {
    return (
        <span className="avatar-sm" style={{ width: size, height: size, fontSize: size * 0.45 }}>
            {src ? <img src={src} alt="" /> : (name.trim()[0] || "?").toUpperCase()}
        </span>
    )
}

// the person's own profile photo, with their mascot as a little sticker on the corner
export function PersonAvatar({ look, name = "", size = 46 }) {
    const badge = Math.round(size * 0.62)
    return (
        <span className="person-avatar" style={{ width: size, height: size }}>
            <span className="person-photo">
                {look?.profileImage ? (
                    <img src={look.profileImage} alt="" />
                ) : (
                    <b>{(name || "?").trim().charAt(0).toUpperCase()}</b>
                )}
            </span>
            {look && look.stage && (
                <span className="person-pet">
                    <PetFace look={look} size={badge} />
                </span>
            )}
        </span>
    )
}
