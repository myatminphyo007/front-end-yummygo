export default function SkeletonGrid({ n = 3 }) {
    return (
        <div className="grid">
            {Array.from({ length: n }).map((_, i) => (
                <div className="skeleton-card" key={i}>
                    <div className="sk sk-img"></div>
                    <div className="sk sk-line w60"></div>
                    <div className="sk sk-line w80"></div>
                    <div className="sk sk-line w40"></div>
                </div>
            ))}
        </div>
    )
}