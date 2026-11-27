import { useEffect, useState } from "react"
import api from "../api/axios"

// asks for the look of many visitors' mascots at once: { userId: { stage, gender, outfit, mood, name } }
export default function usePetLooks(ids) {
    const [looks, setLooks] = useState({})
    const key = [...new Set(ids.filter(Boolean))].sort().join(",")

    useEffect(() => {
        if (!key) return
        api.get(`/pet/looks?ids=${key}`)
            .then((res) => setLooks(res.data))
            .catch(() => {})
    }, [key])

    return looks
}
