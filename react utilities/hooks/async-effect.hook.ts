import { useEffect } from "react"

export function useAsyncEffect(callback: () => Promise<(() => void) | void>, dependencies: any[]) {
	useEffect(() => {
		const promise = callback()
		return () => {
			promise.then(remover => { remover?.() })
		}
	}, dependencies)
}
