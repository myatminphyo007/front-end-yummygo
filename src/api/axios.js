import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:4000/api`,
})

// ----- slow server detection (Render free server wakes up slowly) -----
let pending = 0
let timer = null

const startTrack = (config) => {
    // photo uploads are slow on purpose, so they do not count
    if (config.data instanceof FormData) return
    config.__tracked = true
    pending++
    if (pending === 1) {
        clearTimeout(timer)
        timer = setTimeout(() => window.dispatchEvent(new Event("api:slow")), 3500)
    }
}

const endTrack = (config) => {
    if (!config || !config.__tracked) return
    config.__tracked = false
    pending = Math.max(0, pending - 1)
    if (pending === 0) {
        clearTimeout(timer)
        window.dispatchEvent(new Event("api:idle"))
    }
}

// send the token with every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) config.headers.Authorization = `Bearer ${token}`
    startTrack(config)
    return config
})

api.interceptors.response.use(
    (res) => {
        endTrack(res.config)
        return res
    },
    (err) => {
        endTrack(err.config)
        return Promise.reject(err)
    }
)

export default api