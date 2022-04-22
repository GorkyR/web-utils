import { useState } from "react"

type Partial<T> = { [key in keyof T]?: T[key] }
export function usePartialState<T>(initial_state?: T): [
	T, 
	(state_setter: Partial<T> | ((old_state: Partial<T>) => Partial<T>)) => void, 
	() => void
] {
	const [state, setState] = useState(initial_state as T)
	return [
		state,
		(state_setter: Partial<T> | ((old_state: T) => Partial<T>)) => {
			switch (typeof state_setter) {
				case 'object':
					setState(old_state => ({ ...old_state, ...state_setter }))
					return
				case 'function':
					setState(old_state => ({ ...old_state, ...state_setter(old_state) }))
					return
				default:
					setState(state_setter)
			}
		},
		() => setState(initial_state as T)
	]
}