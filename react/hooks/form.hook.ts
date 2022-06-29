import { useState } from "react"


/*

const form = useForm({
	initial: {
		name: 'Gorky',
		last_name: 'Rojas',
		phone: '',
		age: 0,
		alive: true,
		parent: {
			name: 'Gustavo',
			last_name: 'Rojas'
		},
	}

	validation: {
		name: (name) => name?.trim()? null : 'Requerido',
		last_name: (last_name) => last_name?.trim()? null : 'Requerido',
		age: v => v < 18? null : 'Debe ser mayor de edad.'
		parent: {
			name: (name) => name?.trim()? null : 'Requerido',
			last_name: (last_name) => last_name?.trim()? null : 'Requerido',
		}
	},
})

return (
	<form onSubmit={form.submit(values => console.debug(values))}>
		<input {...form.field('name')}/>
		<span>{form.error('name')}</span>

		<input {...form.field('last_name')}/>
		<span>{form.error('last_name')}</span>

		<input {...form.field('age', { type: 'number', min: 18 })}/>

		<input {...form.field('phone', { format: mask('(###) ###-####') })}/>

		<input {...form.field('alive', { type: 'checkbox' })}/>

		<input {...form.field(['parent', 'name'])}/>
		<span>{form.error(['parent', 'name'])}</span>

		<input {...form.field(['parent', 'last_name'])}/>
		<span>{form.error(['parent', 'last_name'])}</span>

		<button type="reset" onClick={() => form.reset()}>
			Clear
		</button>
	</form>
)

*/

type ValueOf<T> = T[keyof T]
type Partial<T> = { [key in keyof T]?: T[key] }
type FormValidation<T> = FormValidationRecursive<T, T>
type FormValidationRecursive<ST, T> = { [key in keyof T]?: ((value: T[key] | undefined, values?: Partial<ST>) => string | null | undefined) | FormValidationRecursive<ST, T[key]> | FormValidationRecursive<ST,ValueOf<T[key]>> }
type FormConfiguration<T> = {
	initial?: Partial<T>,
	validation?: FormValidation<T>,
	validate_native?: boolean
}
type FormControlSubmitHandler<T> = (callback: (values: Partial<T>) => void) => ((event: React.FormEvent<HTMLFormElement>) => void)
type FormFieldConfiguration = {
	type?: React.HTMLInputTypeAttribute,
	format?: (value: string) => string,
	min?: number,
	max?: number,
};
type FormFieldProperties = {
	type: string,
	checked?: boolean,
	'data-form-key': string,
	value: string,
	onChange: React.ChangeEventHandler,
	min?: number,
	max?: number,
};
type FormFieldRegistrar = (path: string | (string | number)[], config?: FormFieldConfiguration) => FormFieldProperties
type FormControl<T> = {
	submit: FormControlSubmitHandler<T>,
	field: FormFieldRegistrar,
	data: Partial<T>,
	setData: (values: Partial<T> | ((values: Partial<T>) => Partial<T>)) => void,
	error: (path: string | (string | number)[]) => string | null | undefined,
	errors: () => { [key: string]: string } | undefined,
	reset: () => void
}
export function useForm<T>(config?: FormConfiguration<T>): FormControl<T> {
	const {initial, validation} = config ?? {}
	const [data, setData] = useState(initial ?? { } as Partial<T>)
	const [errors, setErrors] = useState(undefined as { [key: string]: string | undefined } | undefined)

	function invalids(scoped_data: any, validation: any, prefix?: string): { [key: string]: string } | undefined {
		if (!validation) return undefined
		let errors: { [key: string]: string } = { }

		if (Array.isArray(scoped_data)) {
			for (let i = 0; i < scoped_data.length; i++)
				errors = { ...errors, ...invalids(scoped_data[i], validation, [prefix, i].join('.')) }
			return errors
		}

		for (let key in validation) {
			const prefixed_key = prefix? [prefix, key].join('.') : key
			const validator = validation[key]
			switch (typeof validator) {
				case 'function':
					const error = validator(scoped_data[key], data)
					if (error != null)
						errors[prefixed_key] = error
					break
				case 'object':
					errors = { ...errors, ...invalids(scoped_data[key], validator, prefixed_key) }
					break
			}
		}

		return Object.keys(errors).length? errors : undefined
	}

	return {
		submit: (callback) => (event) => {
			event.preventDefault()
			const target = event.target as HTMLFormElement
			const errors = invalids(data, validation)
			setErrors(errors)
			if (!errors) {
				callback(data)
				target.querySelectorAll('input').forEach(input => input.setCustomValidity(''))
				return
			}
			if (config?.validate_native ?? true)
				Object.keys(errors).slice(0, 1).forEach(field_key => {
					const field = target.querySelector(`[data-form-key="${field_key}"]`) as HTMLInputElement
					field.setCustomValidity(errors[field_key])
					field.reportValidity()
				})
		},
		field: (path, config) => {
			const value = typeof path === 'string'
				? (data as any)[path] 
				: path.reduce((_data, key) => _data[key] ?? '', data as any)
			const key = typeof path === 'string' ? path : path.join('.')
			return {
				"data-form-key": key,
				type: config?.type ?? 'text',
				value: config?.type === 'checkbox'? undefined : value,
				checked: config?.type === 'checkbox'? value : undefined,
				min: config?.min,
				max: config?.max,
				onChange: ({ target }: React.ChangeEvent<HTMLInputElement>) => {
					let { value, checked } = target
					value = config?.format?.(value) ?? value
					setData(data => drill_into_path(data, typeof path === 'string'? [path] : path, config?.type === 'checkbox'? !checked : config?.type === 'number'? Number(value) : value))
					target.setCustomValidity('')
					target.reportValidity()
					setErrors(errors => ({ ...errors, [key]: undefined }))
				},
			}
		},
		data,
		setData: (setter) => {
			setter = typeof setter === 'function'? setter(data) : setter
			setData(old_data => ({ ...old_data, ...setter }))
		},
		error: (path) => {
			if (!errors) return undefined
			return errors[typeof path === 'string'? path : path.join('.')]
		},
		errors: () => {
			const errors = invalids(data, validation)
			setErrors(errors)
			return errors
		},
		reset: () => setData(initial ?? {})
	}
}

function drill_into_path(data: any, path: (string | number)[], value: any) {
	if (!path.length) return value
	const key = path[0]
	if (!data) 
		data = typeof key === 'string'? {} : []
	data = {...data, [key]: drill_into_path(data[key], path.slice(1), value)}
	if (typeof key === 'number') {
		const array: any[] = []
		for (let key in data)
			array[key as any] = data[key]
		return array
	}
	return data
}

export function useField(config?: FormFieldConfiguration & { initial?: string | number | boolean, onChange?: (value: string | number | boolean) => void }) {
	const [data, setData] = useState(config?.initial ?? '')
	return {
		value: (config?.type !== 'checkbox'? data : undefined) as string | number | undefined,
		checked: (config?.type === 'checkbox'? data : undefined) as boolean | undefined,
		type: config?.type ?? 'text',
		min: config?.min, max: config?.max,
		onChange: config?.type !== 'checkbox'
			? ({ target: { value } }: any) => { 
				value = config?.format?.(value) ?? value
				setData(config?.type !== 'number'? value : Number(value))
				config?.onChange?.(value)
			} : () => {},
		onClick: config?.type === 'checkbox'
			? ({ target: { checked } }: any) => {
				setData(checked)
				config?.onChange?.(checked)
			} : () => {}
	}
}