// Yummy Go service worker.
// - pages: always try the network first, show offline.html if there is no internet
// - own static files (js, css, images): serve from cache fast, refresh in the background
// - the API (other website) and Cloudinary photos are never touched
const VERSION = "v1"
const CACHE = `yg-static-${VERSION}`
const PRECACHE = ["/offline.html", "/logo.png", "/mascot.png", "/icons/icon-192.png"]

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    )
})

self.addEventListener("fetch", (event) => {
    const req = event.request
    if (req.method !== "GET") return

    const url = new URL(req.url)
    if (url.origin !== self.location.origin) return // API, Cloudinary, fonts...

    // opening a page
    if (req.mode === "navigate") {
        event.respondWith(fetch(req).catch(() => caches.match("/offline.html")))
        return
    }

    // our own static files
    const isStatic =
        ["script", "style", "image", "font"].includes(req.destination) ||
        url.pathname.startsWith("/assets/") ||
        url.pathname.startsWith("/mascots/")
    if (!isStatic) return

    event.respondWith(
        caches.open(CACHE).then(async (cache) => {
            const cached = await cache.match(req)
            const fresh = fetch(req)
                .then((res) => {
                    if (res && res.status === 200) cache.put(req, res.clone())
                    return res
                })
                .catch(() => cached)
            return cached || fresh
        })
    )
})
