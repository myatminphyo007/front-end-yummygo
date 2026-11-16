import { useEffect, useState } from "react"

const KEY = "yg-favs"

const read = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
}

export default function useFavorites() {
    const [ids, setIds] = useState(read)

    useEffect(() => {
        const on = () => setIds(read())
        window.addEventListener("fav:change", on)
        return () => window.removeEventListener("fav:change", on)
    }, [])

    const toggle = (id) => {
        const cur = read()
        const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
        try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* ignore */ }
        window.dispatchEvent(new Event("fav:change"))
    }

    return { ids, has: (id) => ids.includes(id), toggle }
}