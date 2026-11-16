export default function initFx() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const SEL = ".grid > *, .features > *, .section-title, .panel"

    // navbar glass after scrolling
    const onScroll = () => document.body.classList.toggle("scrolled", window.scrollY > 20)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })

    // fade + slide up when an element enters the screen
    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((e) => {
                if (!e.isIntersecting) return
                const el = e.target
                el.classList.add("in")
                io.unobserve(el)
                setTimeout(() => {
                    el.classList.add("done")
                    el.style.transitionDelay = ""
                }, 900)
            })
        },
        { threshold: 0.1 }
    )

    let queued = false
    const scan = () => {
        queued = false
        document.querySelectorAll(SEL).forEach((el) => {
            if (el.dataset.fx) return
            el.dataset.fx = "1"
            if (reduce) return
            const i = Array.prototype.indexOf.call(el.parentNode.children, el)
            el.style.transitionDelay = (i % 6) * 70 + "ms"
            el.classList.add("reveal")
            io.observe(el)
        })
    }
    // pages load their data later, so watch for new elements
    const mo = new MutationObserver(() => {
        if (!queued) {
            queued = true
            requestAnimationFrame(scan)
        }
    })
    mo.observe(document.body, { childList: true, subtree: true })
    scan()

    // 3D tilt on cards
    const tilt = (e) => {
        if (reduce) return
        const card = e.target.closest && e.target.closest(".grid > *")
        if (!card || !card.classList.contains("done")) return
        const r = card.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        card.style.setProperty("--ry", (x * 8).toFixed(2) + "deg")
        card.style.setProperty("--rx", (-y * 8).toFixed(2) + "deg")
    }
    const untilt = (e) => {
        const card = e.target.closest && e.target.closest(".grid > *")
        if (card && !card.contains(e.relatedTarget)) {
            card.style.setProperty("--rx", "0deg")
            card.style.setProperty("--ry", "0deg")
        }
    }
    document.addEventListener("mousemove", tilt)
    document.addEventListener("mouseout", untilt)

    return () => {
        window.removeEventListener("scroll", onScroll)
        document.removeEventListener("mousemove", tilt)
        document.removeEventListener("mouseout", untilt)
        io.disconnect()
        mo.disconnect()
    }
}