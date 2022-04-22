const masks: { [char: string]: (char: string) => boolean } = {
	'#': _ => /[0-9]/.test(_),
	'a': _ => /[A-z]/.test(_),
	'.': _ => /[A-z0-9]/.test(_)
};
function validators(mask: string) {
	return [...mask].filter(m => m in masks).map(m => masks[m])
}
function unmask(value: string, mask: string) {
	const { value: unmasked_value } = [...value].reduce(({ value, validators }, char) => {
		if (validators.length && validators[0](char))
			return { value: value + char, validators: validators.slice(1) }
		return { value, validators }
	}, { value: '', validators: validators(mask) })
	return unmasked_value
}
export function mask(mask: string): (value: string) => string
export function mask(mask: string, value: string): string
export function mask(mask_: string, value?: string): ((value: string) => string) | string {
	if (value == null) return (value) => {
		let unmasked_value = unmask(value, mask_)
		if (!unmasked_value) return ''
		let masked_value = ''
		for (let m of mask_) {
			if (!unmasked_value) break
			if (m in masks) {
				masked_value += unmasked_value[0]
				unmasked_value = unmasked_value.substring(1)
			} else masked_value += m
		}
		return masked_value
	}; else return mask(mask_)(value)
}