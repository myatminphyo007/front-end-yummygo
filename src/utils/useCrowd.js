import { useEffect, useState } from "react"
import api from "../api/axios"

// one shared copy of the crowd data for every card on the page
let cache = {}
let timer = null
const listeners = new Set()

const load = () =>
    api
        .get("/crowd")
        .then((res) => {
            cache = res.data
            listeners.forEach((fn) => fn(cache))
        })
        .catch(() => {})

export default function useCrowd() {
    const [data, setData] = useState(cache)

    useEffect(() => {
        listeners.add(setData)
        if (listeners.size === 1) {
            load()
            timer = setInterval(load, 60000) // refresh every minute
        } else {
            setData(cache)
        }
        return () => {
            listeners.delete(setData)
            if (listeners.size === 0) {
                clearInterval(timer)
                timer = null
            }
        }
    }, [])

    return data
}
