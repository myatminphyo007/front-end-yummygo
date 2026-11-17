import { createContext, useContext, useState } from "react"
import api from "../api/axios"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("user")
        return saved ? JSON.parse(saved) : null
    })

    const saveUser = (data) => {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data))
        setUser(data)
    }

    const login = async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password })
        saveUser(data)
        return data
    }

    // FormData, because register accepts a profile image
    const register = async (formData) => {
        const { data } = await api.post("/auth/register", formData)
        saveUser(data)
        return data
    }

    // change only some fields (name, photo) and keep the token
    const updateUser = (patch) => {
        const next = { ...user, ...patch }
        localStorage.setItem("user", JSON.stringify(next))
        setUser(next)
    }

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, register, updateUser, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)