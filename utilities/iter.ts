export type Iter<T> = Generator<T> & {
	filter(predicate: (item: T, index?: number) => boolean): Iter<T>
	map<R>(transformer: (item: T, index?: number) => R): Iter<R>

	take(count: number): Iter<T>
	take(predicate: (item: T) => boolean): Iter<T>
	take(predicate: (item: T, index: number) => boolean): Iter<T>

	skip(count: number): Iter<T>
	skip(predicate: (item: T) => boolean): Iter<T>
	skip(predicate: (item: T, index: number) => boolean): Iter<T>

	slice(start: number, end: number): Iter<T>

	chunk(count: number): Iter<T[]>

	at(index: number): T | undefined
	collect(): T[]
}

function iter<T>(generator: Generator<T>): Iter<T> {
	const iter = generator as Iter<T>
	iter.filter = filter.bind(iter) as any
	iter.map = map.bind(iter) as any
	iter.take = take.bind(iter) as any
	iter.skip = skip.bind(iter) as any
	iter.chunk = chunk.bind(iter) as any
	iter.slice = function (start: number, end: number): Iter<T> {
		return this.skip(start).take(end - start)
	}
	iter.at = function (index: number): T {
		return this.skip(index).next().value
	}
	iter.collect = function (): T[] {
		return [...this]
	}
	return iter
}

function filter<T>(this: Iter<T>, predicate: (item: T, index?: number) => boolean): Iter<T> {
	function* _filter(collection: Iter<T>, _predicate: typeof predicate): Generator<T> {
		for (let item of collection) if (_predicate(item)) yield item
	}
	const iterator = iter(_filter(this, predicate))
	iterator[Symbol.iterator] = () => _filter(this, predicate)
	return iterator
}

function map<T, R>(this: Iter<T>, transformer: (item: T, index?: number) => R): Iter<R> {
	function* _map(collection: Iter<T>, _transformer: typeof transformer): Generator<R> {
		for (let item of collection) yield _transformer(item)
	}
	const iterator = iter(_map(this, transformer))
	iterator[Symbol.iterator] = () => _map(this, transformer)
	return iterator
}

function take<T>(this: Iter<T>, count_or_predicate: number | ((item: T, index: number) => boolean)): Iter<T> {
	function* _take(collection: Iter<T>, _count_or_predicate: typeof count_or_predicate): Generator<T> {
		if (typeof _count_or_predicate == 'number') {
			const count = _count_or_predicate
			let i = 0
			for (let item of collection) {
				if (i < count) yield item
				if (++i >= count) return
			}
		} else {
			const predicate = _count_or_predicate
			let i = 0
			for (let item of collection) {
				if (predicate(item, i)) yield item
				else return
			}
		}
	}
	const iterator = iter(_take(this, count_or_predicate))
	iterator[Symbol.iterator] = () => _take(this, count_or_predicate)
	return iterator
}

function skip<T>(this: Iter<T>, count_or_predicate: number | ((item: T, index: number) => boolean)): Iter<T> {
	function* _skip(collection: Iter<T>, _count_or_predicate: typeof count_or_predicate): Generator<T> {
		if (typeof _count_or_predicate == 'number') {
			const count = _count_or_predicate
			let i = 0
			for (let item of collection) {
				if (i++ < count) continue
				yield item
			}
		} else {
			const predicate = _count_or_predicate
			let i = 0,
				skip = true
			for (let item of collection) {
				if (!skip) {
					yield item
					continue
				}
				if (!predicate(item, i)) {
					skip = false
					yield item
				}
			}
		}
	}
	const iterator = iter(_skip(this, count_or_predicate))
	iterator[Symbol.iterator] = () => _skip(this, count_or_predicate)
	return iterator
}

function chunk<T>(this: Iter<T>, count: number): Iter<T[]> {
	function* _chunk(collection: Iter<T>, _count: number) {
		let chunk: T[] = []
		for (let item of collection) {
			if (chunk.length < count) chunk.push(item)
			if (chunk.length == count) {
				yield chunk
				chunk = []
			}
		}
		if (chunk.length) yield chunk
	}
	const iterator = iter(_chunk(this, count))
	iterator[Symbol.iterator] = () => _chunk(this, count)
	return iterator
}

export function infinite(): Iter<number>
export function infinite(from: number): Iter<number>
export function infinite(from?: number): Iter<number> {
	function* _(from?: number) {
		from ??= 0
		for (let i = from; ; i++) yield i
	}
	const iterator = iter(_(from))
	iterator[Symbol.iterator] = () => _(from)
	return iterator
}

export function range(count: number): Iter<number>
export function range(start: number, end: number): Iter<number>
export function range(start_or_count: number, end?: number): Iter<number> {
	if (end == undefined) return infinite().take(start_or_count)
	return infinite(start_or_count).take(end - start_or_count)
}

declare global {
	interface Array<T> {
		iterate(): Iter<T>
	}
}
Array.prototype.iterate ??= function <T>(this: T[]): Iter<T> {
	function* _iterate(collection: T[]): Generator<T> {
		for (let item of collection) yield item
	}
	const iterator = iter(_iterate(this))
	iterator[Symbol.iterator] = () => _iterate(this)
	return iterator
}
