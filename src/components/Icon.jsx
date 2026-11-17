const PATHS = {
    heart: <path d="M12 21s-7-4.6-9.3-9A5.4 5.4 0 0 1 12 6.5 5.4 5.4 0 0 1 21.3 12C19 16.4 12 21 12 21z" />,
    moon: <path d="M21 13.5A8.5 8.5 0 1 1 10.5 3a7 7 0 0 0 10.5 10.5z" />,
    sun: (
        <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
    ),
    pin: (
        <>
            <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
            <circle cx="12" cy="9.5" r="2.5" />
        </>
    ),
    ticket: <path d="M3 8a2 2 0 0 0 0 8v2h18v-2a2 2 0 0 1 0-8V6H3zM14 6v12" />,
    clock: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </>
    ),
    medal: (
        <>
            <circle cx="12" cy="9" r="5" />
            <path d="M8.5 13.5 7 21l5-3 5 3-1.5-7.5" />
        </>
    ),
    chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
    calendar: <path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4" />,
    gift: <path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7C9 7 8 3.5 10 3.5S12 7 12 7zm0 0c3 0 4-3.5 2-3.5S12 7 12 7z" />,
    camera: (
        <>
            <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
            <circle cx="12" cy="13" r="3.5" />
        </>
    ),
    edit: <path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4" />,
}

export default function Icon({ name, size = 20 }) {
    return (
        <svg
            className="icon"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {PATHS[name]}
        </svg>
    )
}