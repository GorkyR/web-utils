export type UnsubscribeFunction = () => void

export class Watchable<T> {
	constructor(initial_value?: T) {
		this._value = initial_value
	}

	private _value?: T
	private subscribers: { callback: (value: T) => void; should_keep: () => boolean }[] = []

	get value(): T | undefined {
		return this._value
	}
	set value(value: T) {
		this._value = value
		for (let i = 0; i < this.subscribers.length; i++) {
			const { callback, should_keep } = this.subscribers[i]
			if (should_keep && !should_keep()) {
				this.subscribers.splice(i--, 1)
				continue
			}
			callback(value)
		}
	}

	watch(callback: (value: T) => void, should_keep?: () => boolean): UnsubscribeFunction {
		if (should_keep && !should_keep()) return () => {}
		if (this._value !== undefined) callback(this._value)
		const subscriber = { callback, should_keep }
		this.subscribers.push(subscriber)
		return () => {
			const index = this.subscribers.indexOf(subscriber)
			if (index === -1) return
			this.subscribers.splice(index, 1)
		}
	}
	subscribe(callback: (value: T) => void, should_watch?: () => boolean): UnsubscribeFunction {
		return this.watch(callback, should_watch)
	}
}
