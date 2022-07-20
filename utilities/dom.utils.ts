export function create_element<K extends keyof HTMLElementTagNameMap>(
	tag_name: K, 
	options: {
		'class'?: string[] | string
		text?: string
		style?: { [key in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[key] }
	} & { [attribute: string]: any }): HTMLElementTagNameMap[K] 
{
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
		if (attribute == 'style') {
			for (let style in options[attribute])
				element.style[style as any] = (options[attribute] as any)[style as any]
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
	keys = keys.map(k => k === 'space'? ' ' : k)
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