export class Waitable<T> {
	constructor(initial_value?: T) {
		this.value = initial_value!
	}

	private value: T
	private subscribers: ((value: T) => void)[] = []
	get(): Promise<T> {
		return new Promise<T>(resolve => {
			if (this.value !== undefined) resolve(this.value)
			this.subscribers.push(resolve)
		})
	}
	set(value: T) {
		this.value = value
		for (let i = this.subscribers.length - 1; i >= 0; i--) {
			this.subscribers[i](value)
			this.subscribers.splice(i, 1)
		}
	}
	reset() {
		this.value = undefined as any
	}
}
