import { useEffect } from "react"
import { global_hotkey } from "./dom.utils"

export function useHotkey(shortcut: string | string[], callback: () => void) {
   useEffect(() => global_hotkey(shortcut, callback))
}
