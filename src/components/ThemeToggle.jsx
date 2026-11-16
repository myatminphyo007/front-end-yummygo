import useTheme from "../utils/useTheme"
import Icon from "./Icon"

export default function ThemeToggle() {
    const { theme, toggle } = useTheme()
    return (
        <button className="season-btn theme-btn" type="button" onClick={toggle} title={theme === "dark" ? "Light" : "Dark"}>
            <span key={theme} className="season-icon">
                <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
            </span>
        </button>
    )
}