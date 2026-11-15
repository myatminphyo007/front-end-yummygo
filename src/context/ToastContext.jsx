import { createContext, useContext, useState, useCallback } from "react"

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
    const [message, setMessage] = useState("")

    const showToast = useCallback((text) => {
        setMessage(text)
        setTimeout(() => setMessage(""), 2500)
    }, [])

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className={`toast ${message ? "show" : ""}`}>{message}</div>
        </ToastContext.Provider>
    )
}

export const useToast = () => useContext(ToastContext)