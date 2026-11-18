import { useEffect, useState } from "react"
import { useLang } from "../context/LanguageContext"

const KEY = "yg-install-dismissed"
const HIDE_DAYS = 14

const isStandalone = () =>
    window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true

const isIOS = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent)

const recentlyDismissed = () => {
    try {
        const t = Number(localStorage.getItem(KEY) || 0)
        return t && Date.now() - t < HIDE_DAYS * 24 * 60 * 60 * 1000
    } catch {
        return false
    }
}

// "Install app" pill. Android / Chrome: real install prompt. iPhone: shows how to Add to Home Screen.
export default function InstallApp() {
    const { t } = useLang()
    const [promptEvent, setPromptEvent] = useState(null)
    const [iosHint, setIosHint] = useState(false)

    useEffect(() => {
        if (isStandalone() || recentlyDismissed()) return

        const onPrompt = (e) => {
            e.preventDefault() // keep it, so we can show our own button
            setPromptEvent(e)
        }
        const onInstalled = () => {
            setPromptEvent(null)
            setIosHint(false)
        }
        window.addEventListener("beforeinstallprompt", onPrompt)
        window.addEventListener("appinstalled", onInstalled)

        // iPhone has no install prompt: show the hint after a few seconds
        let timer
        if (isIOS()) timer = setTimeout(() => setIosHint(true), 4000)

        return () => {
            window.removeEventListener("beforeinstallprompt", onPrompt)
            window.removeEventListener("appinstalled", onInstalled)
            clearTimeout(timer)
        }
    }, [])

    const close = () => {
        try {
            localStorage.setItem(KEY, String(Date.now()))
        } catch {
            /* ignore */
        }
        setPromptEvent(null)
        setIosHint(false)
    }

    const install = async () => {
        if (!promptEvent) return
        promptEvent.prompt()
        await promptEvent.userChoice.catch(() => {})
        setPromptEvent(null)
    }

    if (!promptEvent && !iosHint) return null

    return (
        <div className="install-pill" role="dialog" aria-label={t("pwa.install")}>
            <img src="/mascot.png" alt="" />
            <div className="install-text">
                <strong>{t("pwa.install")}</strong>
                {iosHint && !promptEvent && <span>{t("pwa.iosHint")}</span>}
            </div>
            {promptEvent && (
                <button type="button" className="install-btn" onClick={install}>
                    {t("pwa.installBtn")}
                </button>
            )}
            <button type="button" className="install-x" onClick={close} aria-label="close">
                ×
            </button>
        </div>
    )
}
