import { debounce } from '../utilities'

type SuggestFunction<T> = (input: string) => Promise<T[]>

type SuggestionClientOptions<T> = {
	for: SuggestFunction<T>
	display_as?: (value: T) => string
	debouncing_milliseconds?: number
}

export class SuggestionClient<T> {
	suggest: (input: string) => void
	get suggestions() {
		return this.values.map(this.display)
	}
	get(value: string) {
		const pairs = this.values.map((v) => [v, this.display(v)] as [T, string])
		return pairs.find(([v, d]) => d == value)?.[0] ?? undefined
	}

	private _on_suggestions: (() => void)[] = []

	public values: T[] = []
	private display: (value: T) => string

	constructor(options: SuggestionClientOptions<T>) {
		this.display = options.display_as ?? ((v) => (typeof v == 'string' ? v : JSON.stringify(v)))
		this.suggest = debounce(async (input: string) => {
			if (this.suggestions.includes(input)) return
			this.values = (await options.for(input)) ?? []
			this._on_suggestions.forEach((callback) => callback())
		}, options.debouncing_milliseconds ?? 100)
	}

	subscribe(callback: () => void) {
		if (!this._on_suggestions.includes(callback)) this._on_suggestions.push(callback)
	}
}

export const suggestions = <T>(options: SuggestionClientOptions<T>) => new SuggestionClient(options)
