export async function export_file(contents: Blob | string, filename: string, mimetype: string): Promise<void> {
	if (typeof contents === 'string')
		contents = new Blob([contents], { type: mimetype })
	const anchor = document.createElement('a')
	anchor.href = URL.createObjectURL(contents)
	anchor.download = filename
	document.body.appendChild(anchor)
	anchor.click()
	anchor.parentElement?.removeChild(anchor)
}

export async function export_text_file(contents: string, filename: string): Promise<void> {
	const blob = new Blob([contents], { type: 'text/plain' })
	const anchor = document.createElement('a')
	anchor.href = URL.createObjectURL(blob),
	anchor.download = filename
	document.body.appendChild(anchor)
	anchor.click()
	anchor.parentElement?.removeChild(anchor)
}

export function load_text_file(): Promise<string> {
	return new Promise(resolve => {
		const input = document.createElement('input')
		input.type = 'file',
		input.style.display = 'none'
		input.oninput = () => {
			const file = input.files![0]
			const reader = new FileReader()
			reader.onload = () => {
				resolve(reader.result as string)
			}
			reader.readAsText(file)
		}
		document.body.appendChild(input)
		input.click()
	})
}

export function table_to_csv(table: { [key: string]: string | number }[]): string {
	if (!table.length) return ''

	function snake_case_to_capital(text: string): string {
		const spaced = text.replaceAll(/_(.)/g, ' $1').toLowerCase().trim()
		return spaced.length > 1? spaced[0].toUpperCase() + spaced.substring(1) : spaced.toUpperCase()
	}

	const headers = Object.keys(table[0])
	const rows = table.map(item => headers
		.map(h => item[h] ?? '')
		.map(c => typeof c === 'string'? c.replaceAll(/,/g, '{;}') : String(c)))
	return [headers.map(snake_case_to_capital)].concat(rows).map(r => r.join(',')).join('\n')
}