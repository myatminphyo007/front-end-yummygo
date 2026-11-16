import { useEffect, useState } from "react"
import { SEASONS, seasonOf, readChoice, saveChoice } from "./season"

export default function useSeason() {
    const [choice, setChoice] = useState(readChoice)

    // other components change the season too
    useEffect(() => {
        const on = () => setChoice(readChoice())
        window.addEventListener("season:change", on)
        return () => window.removeEventListener("season:change", on)
    }, [])

    const season = choice === "auto" ? seasonOf() : choice

    // the CSS colors follow this attribute
    useEffect(() => {
        document.documentElement.dataset.season = season
    }, [season])

    // Auto -> spring -> summer -> autumn -> winter -> Auto
    const cycle = () => {
        const order = ["auto", ...SEASONS]
        const next = order[(order.indexOf(choice) + 1) % order.length]
        saveChoice(next)
        window.dispatchEvent(new Event("season:change"))
    }

    return { choice, season, cycle }
}