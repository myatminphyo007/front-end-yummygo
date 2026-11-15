import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { LanguageProvider } from "./context/LanguageContext"
import { AuthProvider } from "./context/AuthContext"
import { ToastProvider } from "./context/ToastContext"
import App from "./App"
import "./style.css"

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <LanguageProvider>
                <AuthProvider>
                    <ToastProvider>
                        <App />
                    </ToastProvider>
                </AuthProvider>
            </LanguageProvider>
        </BrowserRouter>
    </StrictMode>
)