export const SEASONS = ["spring", "summer", "autumn", "winter"]

export const ICON = { spring: "🌸", summer: "☀️", autumn: "🍂", winter: "❄️" }

// emojis around the 3D ring
export const RING = {
    spring: ["🍡", "🌸", "🍵", "🍙", "🍢", "🐙"],
    summer: ["🍧", "🎆", "🍉", "🍦", "🍢", "🐙"],
    autumn: ["🍂", "🌰", "🍠", "🍁", "🍡", "🍢"],
    winter: ["⛄", "🍲", "♨️", "🍢", "🍡", "❄️"],
}

// date -> season (Japan): Mar-May spring, Jun-Aug summer, Sep-Nov autumn, Dec-Feb winter
export const seasonOf = (date = new Date()) => {
    const m = date.getMonth() + 1
    if (m >= 3 && m <= 5) return "spring"
    if (m >= 6 && m <= 8) return "summer"
    if (m >= 9 && m <= 11) return "autumn"
    return "winter"
}

const KEY = "yg-season"

export const readChoice = () => {
    try {
        const v = localStorage.getItem(KEY)
        return v === "auto" || SEASONS.includes(v) ? v : "auto"
    } catch {
        return "auto"
    }
}

export const saveChoice = (v) => {
    try {
        localStorage.setItem(KEY, v)
    } catch {
        // storage can be blocked, the season still works for this visit
    }
}