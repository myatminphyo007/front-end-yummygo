// 3D mascot loader – same props as before: <TakoLoader size={64} label="Loading..." />
const LAYERS = 8;

export default function TakoLoader({ size = 64, label }) {
    const s = Math.round(size * 1.5);
    return (
        <div className="ml-wrap" role="status" aria-live="polite">
            <div className="ml-stage" style={{ width: s, height: s, "--s": `${s}px` }}>
                <div className="ml-hop">
                    <div className="ml-tilt">
                        {Array.from({ length: LAYERS }, (_, i) => (
                            <img
                                key={i}
                                className="ml-layer"
                                src="/mascot.png"
                                alt=""
                                draggable="false"
                                style={{
                                    "--z": `${(i - (LAYERS - 1)) * 1.8}px`,
                                    "--b": (0.5 + (0.5 * i) / (LAYERS - 1)).toFixed(2),
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <div className="ml-shadow" style={{ "--s": `${s}px` }} />
            {label ? <div className="ml-label">{label}</div> : null}
        </div>
    );
}
