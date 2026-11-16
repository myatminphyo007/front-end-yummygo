import { useEffect, useState } from "react"

const KEY = "yg-theme"

const read = () => {
    try { return localStorage.getItem(KEY) } catch { return null }
}
const system = () =>
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

export default function useTheme() {
    const [theme, setTheme] = useState(() => read() || system())

    useEffect(() => {
        document.documentElement.dataset.theme = theme
    }, [theme])

    const toggle = () => {
        const next = theme === "dark" ? "light" : "dark"
        try { localStorage.setItem(KEY, next) } catch { /* ignore */ }
        setTheme(next)
    }

    return { theme, toggle }
}