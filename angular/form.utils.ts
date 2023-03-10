import { Directive, ElementRef, HostListener, Input } from '@angular/core'
import { date, format_time_short, time } from './date.utils'

export class Form {
	values: any = {}
	errors: any = {}
	_error_class: string
	_form_element: HTMLElement | undefined

	get v() {
		return this.values
	}
	get e() {
		return this.errors
	}

	private validators: Validations
	private requirements: Requirements
	private setters: Setters
	private required_message: string
	private on_change?: (values: typeof this.values, name: string) => void
	private default_values: any = {}
	private primitive_values: {} = {}

	constructor(options?: {
		default?: { [field: string]: any }
		validation?: Validations
		required?: Requirements
		set_as?: Setters
		on_change?: (values: any, name: string) => void
		error_class?: string
		required_message?: string
	}) {
		this.default_values = flatten(options?.default ?? {})
		for (let name in this.default_values) {
			const prop_desc = Object.getOwnPropertyDescriptor(this.default_values, name)
			if (prop_desc?.get) put(this.values, name_to_path(name), this.default_values, name)
			else put(this.values, name_to_path(name), copy(this.default_values[name]))
		}
		this.validators = options?.validation ?? {}
		this.requirements = options?.required ?? {}
		this.setters = options?.set_as ?? {}
		this.on_change = options?.on_change
		this.required_message = options?.required_message || 'Requerido.'
		this._error_class = options?.error_class || 'error'
	}

	private validator(path: string[]) {
		path = path.filter((f) => isNaN(f as any))
		return get(this.validators, path) ?? (() => null)
	}
	private is_required(path: string[]) {
		path = path.filter((f) => isNaN(f as any))
		return get(this.requirements, path) ?? false
	}
	private setter(path: string[]) {
		path = path.filter((f) => isNaN(f as any))
		return get(this.setters, path) ?? ((v: any) => v)
	}

	set(name: string, value: any, should_set_error = true) {
		const path = name_to_path(name)

		if (value !== undefined && this._form_element) {
			const element = this._form_element.querySelector(`[name="${name}"]`) as HTMLInputElement
			if (element) {
				switch (element.getAttribute('type')) {
					case 'checkbox':
						element.checked = ['true', true].includes(value)
						break
					case 'date':
						element.value = format_date_short(value)
						break
					case 'time':
						element.value = format_time_short(value)
						break
					default:
						element.value = value
				}
			}
		}

		put(this.primitive_values, path, value)
		try {
			value = this.setter(path)(value)
		} catch {
			value = undefined!
		}

		const old_value = get(this.values, path)
		put(this.values, path, value)

		let error
		if (should_set_error) {
			const validation_error = this.validator(path)(value, this.values, this.get(path.slice(0, -1).join('.')))
			const required_error = this.is_required(path) ? (value ? null : this.required_message) : null
			error = validation_error || required_error

			put(this.errors, path, error)
		}
		if (old_value != value) this.on_change?.(this.values, name)
		return error
	}

	get(name: string): any {
		return get(this.values, name_to_path(name))
	}
	get_primitive(name: string): any {
		return get(this.primitive_values, name_to_path(name))
	}

	validate() {
		const values = flatten(this.values)
		for (let name in values) {
			const path = name_to_path(name)
			const value = values[name]

			const validation_error = this.validator(path)(value, this.values, this.get(path.slice(0, -1).join('.')))
			const required_error = this.is_required(path) ? (value ? null : this.required_message) : null

			const error = validation_error || required_error
			put(this.errors, path, error)
		}

		{
			const validate_requirements = (req: string[], prefix: string[] = []) => {
				const slices = range(req.length).map((i) => [...prefix, ...req.slice(0, i + 1)])
				for (let slice of slices) {
					const is_partial = slice.length < prefix.length + req.length
					const val = get(this.values, slice)
					if (val == null && is_partial) break
					else if (Array.isArray(val) && is_partial) {
						for (let i in val) validate_requirements(req.slice(slices.indexOf(slice) + 1), [...slice, i])
						break
					} else if (!val) put(this.errors, slice, this.required_message)
				}
			}
			const requirements = flatten(this.requirements)
			for (let required in requirements) {
				const path = name_to_path(required)
				validate_requirements(path)
			}
		}

		return filter_values(flatten(this.errors), (v) => v)
	}

	valid() {
		return !Object.keys(this.validate()).length
	}

	reset() {
		this.errors = {}
		this.primitive_values = {}
		this.values = {}
		for (let name in this.default_values) {
			const prop_desc = Object.getOwnPropertyDescriptor(this.default_values, name)
			if (prop_desc?.get) put(this.values, name_to_path(name), this.default_values, name)
			else put(this.values, name_to_path(name), copy(this.default_values[name]))
		}
	}
}

@Directive({
	selector: '[form]',
})
export class FormDirective {
	private element: HTMLElement
	constructor(eref: ElementRef) {
		this.element = eref.nativeElement
	}

	@Input() form!: Form

	submitted = false

	ngOnInit() {
		this.form._form_element = this.element
		const form = this.form
		const this_ = this
		function track_fields(fields: HTMLInputElement[]) {
			for (let field of fields) {
				const name = field.getAttribute('name')!
				const default_val = form.get(name) ?? field.getAttribute('data-initial')
				switch (field.getAttribute('type')) {
					case 'checkbox':
						form.set(name, default_val ?? false, false)
						break
					case 'date':
						form.set(name, default_val ?? new Date(), false)
						break
					case 'time':
						form.set(name, default_val ?? time(new Date()), false)
						break
					case 'number':
						form.set(name, (!isNaN(default_val) && Number(default_val)) || 0, false)
						break
					default:
						form.set(name, default_val ?? '', false)
				}
				if (field.tagName == 'SELECT') {
					new MutationObserver(() => (field.value = form.get_primitive(name))).observe(field, { childList: true })
				}

				const handle = ({ target: { value, checked }, data }: any, should_set_error = true) => {
					field.setCustomValidity('')

					switch (field.tagName) {
						case 'INPUT':
							switch (field.getAttribute('type')) {
								case 'checkbox':
									value = checked
									break
								case 'number':
									if (data == '.' && !value.includes('.')) value = undefined
									else value = Number(value)
									break
								case 'date':
									value = date(value)
									field.value = format_date_short(value)
									break
								case 'time':
									value = time(value)
									field.value = format_time_short(value)
									break
							}
							break
						case 'SELECT':
							value = value.trim() && !isNaN(value) && (value.length == 1 || value[0] != '0') ? Number(value) : value
							break
					}
					const error = form.set(name, value, should_set_error)
					if (error) {
						if (should_set_error) field.classList.add(form._error_class)
					} else field.classList.remove(form._error_class)
				}
				field.addEventListener('blur', handle)
				field.addEventListener('input', (e) => handle(e, this_.submitted))
				field.setAttribute('data-form-tracked', 'true')
			}
		}

		const fields: HTMLInputElement[] = Array.from(this.element.querySelectorAll('[name]'))
		track_fields(fields)
		new MutationObserver((m) => {
			const new_fields = Array.from(this.element.querySelectorAll('[name]:not([data-form-tracked])')) as HTMLInputElement[]
			track_fields(new_fields)
		}).observe(this.element, { childList: true, subtree: true })
	}

	@HostListener('submit') onSubmit() {
		this.submitted = true

		const fields: HTMLInputElement[] = Array.from(this.element.querySelectorAll('[name]'))
		const errors = this.form.validate()
		const error_keys = Object.keys(errors)
		let reported = false
		for (let field of fields) {
			const name = field.getAttribute('name')!
			if (error_keys.includes(name)) {
				field.classList.add(this.form._error_class)
				field.setCustomValidity(errors[name])
				if (!reported) {
					field.reportValidity()
					reported = true
				}
			} else {
				field.classList.remove(this.form._error_class)
				field.setCustomValidity('')
			}
		}
	}
}

type Validator = (value: string, values: any, parent?: any) => string | null
type Setter = (value: string) => any
type Validations = { [key: string]: Validations | Validator }
type Errors = { [key: string | number]: Errors | string | null }
type Setters = { [key: string]: Setters | Setter }
type Requirements = { [key: string]: Requirements | true }

function put(obj: any, path: string[], data: any): void
function put(obj: any, path: string[], data: any, property: string): void
function put(obj: any, path: string[], data: any, property?: string) {
	const desc = property ? Object.getOwnPropertyDescriptor(data, property) : undefined
	if (path.length == 1) {
		if (desc) Object.defineProperty(obj, path[0], desc)
		else obj[path[0]] = data
	} else {
		if (obj[path[0]] == null) {
			if (isNaN(path[1] as any)) obj[path[0]] = {}
			else obj[path[0]] = []
		}
		put(obj[path[0]], path.slice(1), data, property as any)
	}
}

function get(obj: any, path: string[]): any {
	if (path.length == 1) return obj[path[0]]
	else {
		if (obj[path[0]] == null) return undefined
		return get(obj[path[0]], path.slice(1))
	}
}

function flatten(obj: any): any {
	const result: any = {}
	for (let prop in obj) {
		const prop_desc = Object.getOwnPropertyDescriptor(obj, prop)
		if (prop_desc?.get) Object.defineProperty(result, prop, prop_desc)
		else if (obj[prop] == null || typeof obj[prop] != 'object') result[prop] = obj[prop]
		else {
			if (!['Array', 'Object'].includes(obj[prop]?.constructor?.name)) {
				result[prop] = obj[prop]
				continue
			}
			if (!Object.keys(obj[prop]).length) {
				result[prop] = Array.isArray(obj[prop]) ? [] : {}
				continue
			}
			const f_obj = flatten(obj[prop])
			for (let f_prop in f_obj) put(result, [prop + '.' + f_prop], f_obj, f_prop)
		}
	}
	return result
}

function filter_values(obj: any, filter: (val: any) => boolean): any {
	const filtered: any = {}
	for (let prop in obj) {
		const value = obj[prop]
		if (filter(value)) filtered[prop] = value
	}
	return filtered
}

function name_to_path(path: string): string[] {
	return path.split('.')
}

function range(count: number) {
	const nums = []
	for (let i = 0; i < count; i++) nums.push(i)
	return nums
}

function format_date_short(datelike: Date | string | number) {
	const date = new Date(typeof datelike === 'string' && datelike.length <= 10 ? datelike + 'T00:00' : datelike)
	return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

function copy<T>(object: T): T {
	switch (typeof object) {
		case 'object':
			if (object == null || (object as any).constructor.name != 'Object') return object
			if (Array.isArray(object)) return object.map(copy) as any

			const copied = {} as T
			for (let key in object) copied[key] = copy(object[key])
			return copied

		default:
			return object
	}
}
