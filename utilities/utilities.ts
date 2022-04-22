export function random(lower_bound: number, upper_bound: number): number {
	return Math.floor(lower_bound + Math.random() * (upper_bound - lower_bound + 1));
}

export function create_element<K extends keyof HTMLElementTagNameMap>(tag_name: K, options: { 'class'?: string[] | string; text?: string } & { [attribute: string]: any }): HTMLElementTagNameMap[K] {
	const element = document.createElement(tag_name);
	for (let attribute of Object.keys(options)) {
		if (attribute == 'class') {
			const class_option = options[attribute];
			if (typeof class_option === 'object')
				for (let class_name of options[attribute] as string[])
					element.classList.add(class_name);
			else if (typeof class_option === 'string')
				element.className = class_option;
			continue;
		}
		if (attribute == 'text') {
			element.textContent = options[attribute] as string;
			continue;
		}
		element.setAttribute(attribute, options[attribute]);
	}
	return element;
}

type RemoveListenerFunction = () => void;
export function global_listener<T extends keyof WindowEventMap>(type: T, selector: string | null | undefined, callback: (event: WindowEventMap[T]) => void): RemoveListenerFunction {
	const listener = (event: WindowEventMap[T]) => {
		if (selector && !(event.target as HTMLElement)?.matches(selector))
			return;
		callback?.(event);
	};
	window.addEventListener(type, listener);
	return () => window.removeEventListener(type, listener);
}

export function global_hotkey(keys: string | string[], callback: () => void): RemoveListenerFunction {
	keys = (typeof keys === 'string'
		? keys.split('+').map(key => key.trim().toLowerCase())
		: keys.map(key => key.toLowerCase()))
	const listener = (event: KeyboardEvent) => {
		let { key, shiftKey, ctrlKey, altKey } = event
		key = key.toLowerCase()
		if (
			['input', 'select','textarea'].every(tag => !(event.target as any as HTMLElement).matches(tag)) &&
			(!['shift', 'ctrl', 'alt'].includes(key) && keys.includes(key)) &&
			(!keys.includes('shift') || shiftKey) &&
			(!keys.includes('ctrl')  || ctrlKey) &&
			(!keys.includes('alt')   || altKey)
		) {
			callback()
			event.preventDefault()
			event.stopPropagation()
		}
	}
	window.addEventListener('keydown', listener)
	return () => window.removeEventListener('keydown', listener)
}

export function range(count: number): number[];
export function range(start: number, end: number): number[];
export function range(start: number, end: number, step: number): number[];
export function range(start_or_count: number, end?: number, step = 1): number[] {
   if (end === undefined) {
      end = start_or_count
      start_or_count = 0;
   }
	const values = []
	for (let i = start_or_count; i < end; i += step)
		values.push(i)
	return values
}

export function matches<T>(item: T, term: string): boolean {
   if (!item) return false;
   if (!term) return true;

   term = term.toLowerCase();
   switch (typeof item) {
      case 'string':
         return item.toLowerCase().includes(term);
      case 'number': case 'bigint':
         let str = item.toString();
         if (!str.includes('.'))
            str += '.00';
         return str.includes(term);
      case 'object':
         if (Array.isArray(item))
            return item.some(o => matches(o, term));
         return Object.values(item).some(v => matches(v, term));
      case 'boolean':
         return item.toString() === term;
      default:
         return false;
   }
}



export function debounce<F extends (...args: any[]) => void>(callback: F, delay_in_milliseconds: number): (...args: Parameters<F>) => void {
	let timeout: any;
	return (...args: Parameters<F>) => {
		if (timeout)
			clearTimeout(timeout);

		timeout = setTimeout(() => {
			callback(...args);
		}, delay_in_milliseconds);
	};
}

export function throttle<F extends (...args: any[]) => void>(callback: F, delay_in_milliseconds: number): (...args: Parameters<F>) => void {
	let blocked: boolean = false;
   let waiting_args: Parameters<F> | null;
   let check = () => {
      if (waiting_args) {
         callback(...waiting_args);
         waiting_args = null;
         setTimeout(check, delay_in_milliseconds);
      } else blocked = false;
   }
	return (...args: Parameters<F>) => {
		if (blocked) {
         waiting_args = args;
         return;
      }

		callback(...args);
		blocked = true;
		setTimeout(check, delay_in_milliseconds);
	};
}

// -----------------------
// --- ARRAY FUNCTIONS ---
// =======================
export function distinct<T, K>(collection: T[], key?: (item: T) => K): T[] {
	if (key)
		return collection?.filter((item, index) => {
			const item_key = key(item);
			return collection.findIndex(i => key(i) == item_key) === index;
		})
	return collection?.filter((item, index) => collection.indexOf(item) === index);
}

export function group<T, K>(collection: T[], key: (item: T) => K): { key: K; items: T[] }[] {
	const groups = new Map<K, T[]>();
	for (let item of collection) {
		const key_value = key(item);
		if (groups.has(key_value))
			groups.get(key_value)?.push(item);
		else
			groups.set(key_value, [item]);
	}
	return [...groups.entries()].map(([key, items]) => ({ key, items }));
}

export function chunk<T>(collection: T[], chunk_length: number): T[][] {
	if (collection?.length <= chunk_length)
		return [collection?.slice()];
	const chunks: T[][] = [];
	for (let i = 0; i < collection?.length; i += chunk_length)
		chunks.push(collection?.slice(i, i + chunk_length));
	return chunks;
}

export function split_into<T>(collection: T[], count: number): T[][] {
	return chunk(collection, Math.ceil(collection?.length / count));
}

export function interspace<T>(collection: T[], interspaced_element: T): T[] {
	if (!collection?.length)
		return collection;
	const interspaced = [collection[0]];
	for (let element of collection.slice(1))
		interspaced.concat([ interspaced_element, element ]);
	return interspaced;
}

export function sample<T>(collection: T[]): T;
export function sample<T>(collection: T[], count: number): T[];
export function sample<T>(collection: T[], count?: number): T | T[] {
	if (count !== undefined) {
		collection = collection.slice();
		const sampled: T[] = [];
		while (sampled.length < count)
			sampled.push(collection?.splice(random(0, collection?.length), 1)[0]);
		return sampled;
	}
	return collection?.[random(0, collection?.length)];
}

export function sort_by<T, K>(collection: T[], key: (item: T) => K, ascending: boolean = true): T[] {
	collection = collection?.slice();
	return collection.sort((a, b) => {
		const ka = key(a);
		const kb = key(b);
		if (ascending)
			return <any>ka - <any>kb;
		else
			return <any>kb - <any>ka;
	})
}

export function flatten<T>(collection: T[][]): T[] {
	return collection?.reduce((flat, next) => flat.concat(next), []);
}

export function sum(collection: number[]): number {
	return collection?.reduce((accumulator, number) => accumulator + number, 0) ?? 0;
}