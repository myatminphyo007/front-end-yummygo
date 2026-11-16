export default function TakoLoader({ size = 48, label }) {
    return (
        <div className="tako-loader" style={{ "--s": `${size}px` }}>
            <div className="tako-ball">
                <i></i>
                <i></i>
                <b></b>
            </div>
            <div className="tako-shadow"></div>
            {label && <span>{label}</span>}
        </div>
    )
}