const names = [
	'Gorky',
	'Jose',
	'Nicol',
	'Raul',
	'Nasser',
	'Katherine',
	'Noemi',
	'Hamilton',
	'Carmen',
	'Josias',
	'Paola',
	'Carolina',
	'Deidry',
	'Pedro',
	'Amaurys',
	'Crismary',
	'Francisco',
	'Reymundi',
	'Diego',
]

const last_names = [
	'Rojas',
	'Rivera',
	'Sanchez',
	'Morillo',
	'Bautista',
	'de los Santos',
	'Gonzalez',
	'Cesto',
	'Alcántara',
	'Hernandez',
	'Cruz',
	'Ortiz',
	'Garcia',
	'Tavares',
	'Mordan',
	'Lara',
	'Tejeda',
	'Paredes',
	'Torres',
	'Andujar',
]

export const fake = {
	name: () => sample(names),
	last_name: () => sample(last_names),
	full_name: () => `${fake.name()} ${fake.last_name()}`,
	number: {
		between: (min: number, max: number) => Math.floor(Math.random() * (1 + max - min)) + min,
		multiple: (factor: number, min: number, max: number) => {
			const [f_min, f_max] = [min, max].map(f => Math.floor(f / factor))
			return factor * fake.number.between(f_min!, f_max!)
		},
	},
	date: (min: Date | string | number, max: Date | string | number) => {
		const [min_date, max_date] = [date(min), date(max)].map(d => only_date(d)).map(d => d.valueOf()) as [
			number,
			number
		]
		return new Date(Math.random() * (1 + max_date - min_date) + min_date)
	},
	bool: () => !!fake.number.between(0, 1),
	mask: (mask: string) => {
		return Array.from(mask)
			.map(c => {
				switch (c) {
					case ';':
						const _: string = fake.mask(fake.bool() ? '~' : '#')
						return _
					case '#':
						return fake.number.between(0, 9)
					case '~':
						return String.fromCodePoint(fake.number.between(65, 65 + 25))
					default:
						return c
				}
			})
			.join('')
	},
	choose<T>(options: T[]) {
		return sample(options)
	},
}

function date(datelike: Date | string | number): Date {
	return new Date(typeof datelike === 'string' && datelike.length <= 10 ? datelike + 'T00:00' : datelike)
}

function sample<T>(collection: T[]): T {
	return collection[Math.floor(Math.random() * collection.length)]!
}

function only_date(date: Date): Date {
	const _ = new Date(date)
	_.setHours(0, 0, 0, 0)
	return _
}
