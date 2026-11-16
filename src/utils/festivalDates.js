const dateOnly = (value) => (value ? String(value).slice(0, 10) : "")

// "2026-08-10 - 2026-08-12"
const festivalRange = (festival) => {
    if (!festival?.startDate || !festival?.endDate) return ""
    const start = dateOnly(festival.startDate)
    const end = dateOnly(festival.endDate)
    return start === end ? start : `${start} - ${end}`
}

// true when the last day of the festival is in the past
const isEnded = (festival) => {
    if (!festival?.endDate) return false
    const today = new Date().toLocaleDateString("sv-SE")
    return dateOnly(festival.endDate) < today
}

export { dateOnly, festivalRange, isEnded }