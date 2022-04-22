declare global {
	interface Array<T> {
		distinct(): T[]
		distinct<K>(key: (item: T) => K): T[]
		group<K>(key: (item: T) => K): { key: K, items: T[] }[]
		chunk(length: number): T[][]
		split_into(count: number): T[][]
		interspace<E>(element: E): (T | E)[]
		sample(): T
		sample(count: number): T[]
		sort_by<K>(key: (item: T) => K, ascending?: boolean): T[]
		reversed(): T[]
	}

	interface String {
		reversed(): string
		chunk(length: number, from_end?: boolean): string[]
	}
}

Array.prototype.distinct ??= function<T, K>(this: T[], key?: (item: T) => K): T[] {
	if (key)
		return this?.filter((item, index) => {
			const item_key = key(item)
			return this.findIndex(i => key(i) == item_key) === index
		})
	return this?.filter((item, index) => this.indexOf(item) === index)
}

Array.prototype.group ??= function<T, K>(this: T[], key: (item: T) => K): { key: K, items: T[] }[] {
	const groups = new Map<K, T[]>()
	for (let item of this) {
		const key_value = key(item)
		if (groups.has(key_value))
			groups.get(key_value)?.push(item)
		else
			groups.set(key_value, [item])
	}
	return [...groups.entries()].map(([key, items]) => ({ key, items }));
}

Array.prototype.chunk ??= function<T>(this: T[], length: number): T[][] {
	if (this?.length <= length)
		return [this?.slice()]
	const chunks: T[][] = []
	for (let i = 0; i < this?.length; i += length)
		chunks.push(this?.slice(i, i + length))
	return chunks
}

Array.prototype.split_into ??= function<T>(this: T[], count: number): T[][] {
	return this.chunk(Math.ceil(this.length / count))
}

Array.prototype.interspace ??= function<T, E>(this: T[], interspaced_element: E): (T | E)[] {
	if (!this.length)
		return this.slice()
	const interspaced: (T | E)[] = [this[0]]
	for (let element of this.slice(1))
		interspaced.concat([ interspaced_element, element ])
	return interspaced;
}

function random(inclusive_upper_bound: number): number {
	return Math.floor(Math.random() * (inclusive_upper_bound + 1))
}

Array.prototype.sample ??= function<T>(count?: number): T | T[] {
	if (count !== undefined) {
		const result = this.slice()
		const sampled: T[] = []
		while (sampled.length < count)
			sampled.push(result?.splice(random(result.length), 1)[0])
		return sampled
	}
	return this?.[random(this.length)]
}

Array.prototype.sort_by ??= function<T, K>(this: T[], key: (item: T) => K, ascending = true): T[] {
	const collection = this.slice();
	return collection.sort((a, b) => {
		const ka = key(a)
		const kb = key(b)
		if (ascending)
			return <any>ka - <any>kb
		else
			return <any>kb - <any>ka
	})
}

Array.prototype.reversed ??= function<T>(this: T[]): T[] {
	return this.slice().reverse()
}

String.prototype.reversed ??= function(this: string): string {
	return [...this].reverse().join('')
}

String.prototype.chunk ??= function(this: string, length: number, from_end = false): string[] {
	if (from_end)
		return this.reversed().chunk(length).map(chunk => chunk.reversed()).reverse()
	return [...this].chunk(length).map(chunk => chunk.join(''))
}

export {}