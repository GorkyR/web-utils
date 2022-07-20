function sample<T>(collection: T[]): T;
function sample<T>(collection: T[], count: number): T[];
function sample<T>(collection: T[], weighter: (item: T, index: number) => number): T;
function sample<T>(collection: T[], count_or_weighter?: number | ((item: T, index: number) => number)): T | T[] {
	if (count_or_weighter == undefined)
		return collection[random(0, collection.length - 1)]
	if (typeof count_or_weighter !== 'function') {
		collection = collection.slice();
		const sampled: T[] = [];
		while (sampled.length < count_or_weighter)
			sampled.push(collection.splice(random(0, collection.length - 1), 1)[0]);
		return sampled;
	} else {
		const weighter = count_or_weighter
		const weighted_items = collection.map((item, index) => {
			const weight = weighter(item, index)
			if (weight < 0)
				throw new Error('Weight cannot be negative')
			return { item, weight }
		})
		const total_weight = sum(weighted_items.map(wi => wi.weight))
		if (!total_weight) throw new Error('All weights cannot be 0')
		const choice = random(0, total_weight - 1)
		let i = 0
		for (let wi of weighted_items) {
			i += wi.weight
			if (i > choice)
				return wi.item
		}
		throw new Error('Unreachable')
	}
}

export function shuffle<T>(collection: T[]): T[] {
	return sample(collection, collection.length)
}

export function random(lower_bound: number, upper_bound: number): number {
	return Math.floor(lower_bound + Math.random() * (upper_bound - lower_bound + 1));
}