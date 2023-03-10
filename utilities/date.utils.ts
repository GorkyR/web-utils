const months_es = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const months_en = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const short_months_es = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.']
const short_months_en = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.']
export function format_date(datelike: Date | string | number, language: 'es' | 'en' = 'es'): string {
	const date_ = date(datelike)
	switch (language) {
		case 'es':
			return `${date_.getDate()} de ${months_es[date_.getMonth()]}, ${date_.getFullYear()}`
		case 'en':
			return `${months_en[date_.getMonth()]} ${date_.getDate()}, ${date_.getFullYear()}`
		default:
			return date_.toDateString()
	}
}

export function format_date_short(datelike: Date | string | number, language: 'es' | 'en' = 'es'): string {
	const date_ = date(datelike)
	switch (language) {
		case 'es':
			return `${date_.getDate()} de ${short_months_es[date_.getMonth()]}, ${date_.getFullYear()}`
		case 'en':
			return `${short_months_en[date_.getMonth()]} ${date_.getDate()}, ${date_.getFullYear()}`
		default:
			return date_.toDateString()
	}
}

export function format_datetime(datelike: Date | string | number, language: 'es' | 'en' = 'es'): string {
	const date_ = date(datelike)
	let hours = date_.getHours()
	hours = hours > 12 ? hours - 12 : hours == 0 ? 12 : hours
	return `${hours.toString().padStart(2, '0')}:${date_.getMinutes().toString().padStart(2, '0')} ${date_.getHours() > 12 ? 'pm' : 'am'}, ${format_date(
		date_,
		language
	)}`
}

export function date_delta(date: Date | string | number, from?: Date) {
	const milliseconds = (from ?? new Date()).valueOf() - date_(date).valueOf()
	return {
		milliseconds,
		seconds: milliseconds / 1_000,
		minutes: milliseconds / (1_000 * 60),
		hours: milliseconds / (1_000 * 60 * 60),
		days: milliseconds / (1_000 * 60 * 60 * 24),
	}
}

export function date(datelike: Date | string | number): Date {
	return new Date(typeof datelike === 'string' && datelike.length <= 10 ? datelike + 'T00:00' : datelike)
}

const date_ = date

export function date_add(
	datelike: Date | string | number,
	{ years, months, days, hours, minutes, seconds }: { years?: number; months?: number; days?: number; hours?: number; minutes?: number; seconds?: number }
): Date {
	const date_ = date(datelike)
	if (years) date_.setFullYear(date_.getFullYear() + years)
	if (months) date_.setMonth(date_.getMonth() + months)
	if (days) date_.setDate(date_.getDate() + days)
	if (hours) date_.setHours(date_.getHours() + hours)
	if (minutes) date_.setMinutes(date_.getMinutes() + minutes)
	if (seconds) date_.setSeconds(date_.getSeconds() + seconds)
	return date_
}

export function date_set(
	datelike: Date | string | number,
	{ year, month, day, hour, minutes, seconds }: { year?: number; month?: number; day?: number; hour?: number; minutes?: number; seconds?: number }
): Date {
	const date_ = date(datelike)
	if (year != null) date_.setFullYear(year)
	if (month != null) date_.setMonth(month)
	if (day != null) date_.setDate(day)
	if (hour != null) date_.setHours(hour)
	if (minutes != null) date_.setMinutes(minutes)
	if (seconds != null) date_.setSeconds(seconds)
	return date_
}

export function today(): Date {
	const date = new Date()
	date.setHours(0, 0, 0, 0)
	return date
}

export function days_between(from: Date, to: Date): Date[] {
	const days = [from]
	while (from < to) {
		const next = date_add(from, { days: 1 })
		days.push(next)
		from = next
	}
	return days
}

export function is_same_day(a: Date, b: Date): boolean {
	return a.getFullYear() == b.getFullYear() && a.getMonth() == b.getMonth() && a.getDate() == b.getDate()
}

export function format_delta(date: Date) {
	const delta = date_delta(date)
	if (delta.days >= 1) {
		const days = Math.floor(delta.days)
		return `hace ${days} día${days == 1 ? '' : 's'}`
	}
	if (delta.hours >= 1) {
		const hours = Math.floor(delta.hours)
		return `hace ${hours} hora${hours == 1 ? '' : 's'}`
	}
	if (delta.minutes >= 1) {
		const minutes = Math.floor(delta.minutes)
		return `hace ${minutes} minuto${minutes == 1 ? '' : 's'}`
	}
	return 'hace unos momentos'
}

export function time(date: Date | string | number) {
	if (typeof date == 'string' && date.length <= 5) date = '0000-01-01T' + date.padStart(5, '0')
	date = date_(date)
	return new Date(0, 0, 0, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
}
const time_ = time

export function format_time_short(date: Date | string | number) {
	const time = time_(date)
	return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`
}

export function format_time(date: Date | string | number, hours: 12 | 24 = 12) {
	const time = time_(date)
	const ohours = time.getHours()
	let hour = hours == 24 || ohours <= 12 ? ohours : ohours - 12
	hour = hours == 12 && hour == 0 ? 12 : hour
	return `${hour}:${time.getMinutes().toString().padStart(2, '0')}${hours == 24 ? '' : ohours >= 12 ? 'pm' : 'am'}`
}

export function format_date_iso_short(date: Date | string | number) {
	date = date_(date)
	return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

export function format_date_iso(date: Date | string | number) {
	date = date_(date)
	return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}T${date.getHours()}:${date
		.getMinutes()
		.toString()
		.padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.000`
}
