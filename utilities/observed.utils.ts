export function observe<T extends { [key: string]: any }>(object: T, on_change?: (property: keyof T, value: any) => void): T {
	return new Proxy(object, {
		set: (_, property, value) => {
			;(object as any)[property] = value
			on_change?.(property as string, value)
			return true
		},
	})
}
