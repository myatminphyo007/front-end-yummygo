// Turns what the admin typed into a Google Maps link.
// It accepts a Google Maps link, coordinates like "34.6786, 135.1790", or a place name.
const mapLink = (text) => {
    const value = (text || "").trim()
    if (!value) return ""

    // a link: use it as it is (only http and https)
    if (/^https?:\/\//i.test(value)) return value

    // coordinates
    if (/^-?\d{1,3}(\.\d+)?\s*,\s*-?\d{1,3}(\.\d+)?$/.test(value)) {
        const point = value.replace(/\s+/g, "")
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point)}`
    }

    // a place name
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`
}

export default mapLink