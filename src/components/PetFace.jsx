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
