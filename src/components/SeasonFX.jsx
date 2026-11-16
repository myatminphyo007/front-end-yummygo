const COUNT = { spring: 14, summer: 16, autumn: 14, winter: 34 }

export default function SeasonFX({ season }) {
    const n = COUNT[season] || 14

    return (
        <div className={`petals fx-${season}`} aria-hidden="true">
            {Array.from({ length: n }).map((_, i) => {
                const size =
                    season === "winter" ? 4 + ((i * 3) % 7) : season === "summer" ? 5 + ((i * 3) % 5) : 10 + ((i * 5) % 14)

                const style = {
                    left: `${(i * 37) % 100}%`,
                    "--s": `${size}px`,
                    "--d": `${(season === "winter" ? 8 : 9) + ((i * 3) % 7)}s`,
                    "--delay": `${-(i * 1.3)}s`,
                    "--dx": `${(i % 2 ? 1 : -1) * (30 + ((i * 7) % 50))}px`,
                }
                // fireflies float where they are, the others fall from the top
                if (season === "summer") style.top = `${((i * 29) % 80) + 8}%`

                return <span key={season + i} style={style} />
            })}

            {season === "summer" &&
                [0, 1, 2].map((i) => (
                    <em
                        key={"boom" + i}
                        className="boom"
                        style={{ left: `${20 + i * 30}%`, top: `${15 + (i % 2) * 20}%`, "--delay": `${i * 1.8}s` }}
                    />
                ))}
        </div>
    )
}