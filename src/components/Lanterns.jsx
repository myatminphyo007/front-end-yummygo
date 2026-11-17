const N = 9
const TEXT = ["祭", "", "福", "", "祭", "", "福", "", "祭"]

export default function Lanterns() {
    return (
        <div className="lanterns" aria-hidden="true">
            <svg viewBox="0 0 1200 180" preserveAspectRatio="none">
                <path d="M0 14 Q600 86 1200 14" fill="none" strokeWidth="3" vectorEffect="non-scaling-stroke" />
            </svg>

            {TEXT.map((txt, i) => {
                const t = (i + 0.5) / N
                const y = 14 + 144 * t * (1 - t) - 1 // follows the curve of the string
                return (
                    <div
                        key={i}
                        className="lantern"
                        style={{ left: `${t * 100}%`, top: `${y}px`, animationDelay: `${-i * 0.45}s` }}
                    >
                        <div className="cord"></div>
                        <div className="cap"></div>
                        <div className="body"><b>{txt}</b></div>
                        <div className="cap low"></div>
                        <div className="tassel"></div>
                    </div>
                )
            })}
        </div>
    )
}