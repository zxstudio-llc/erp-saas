"use client"

import * as React from "react"

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = React.useState<boolean>(() => {
        if (typeof window === "undefined") return false
        return window.matchMedia(query).matches
    })

    React.useEffect(() => {
        if (typeof window === "undefined") return

        const media = window.matchMedia(query)

        const listener = () => {
            setMatches(media.matches)
        }

        // Set initial value (por si cambia antes del effect)
        listener()

        if (media.addEventListener) {
            media.addEventListener("change", listener)
        } else {
            // Safari < 14
            media.addListener(listener)
        }

        return () => {
            if (media.removeEventListener) {
                media.removeEventListener("change", listener)
            } else {
                media.removeListener(listener)
            }
        }
    }, [query])

    return matches
}
