import { Directive, ElementRef, Input } from '@angular/core'
import { SuggestionClient } from './input-suggestions.utils'

@Directive({
	selector: '[suggest]',
})
export class InputSuggestionsDirective<T> {
	@Input() suggest!: SuggestionClient<T>

	private input: HTMLInputElement
	private datalist!: HTMLDataListElement

	constructor(eref: ElementRef) {
		this.input = eref.nativeElement
		const id = `list_for_${this.input.id || this.input.name}_${Math.floor(10_000 + Math.random() * 90_000)}`
		this.datalist = document.createElement('datalist')
		this.datalist.id = id
		this.input.parentElement?.appendChild(this.datalist)
		this.input.setAttribute('list', id)
	}

	ngOnInit() {
		this.input.addEventListener('input', () => {
			this.suggest.suggest(this.input.value)
		})
		this.suggest.subscribe(() => {
			clear_element(this.datalist)
			for (let suggestion of this.suggest.suggestions) {
				const option = document.createElement('option')
				option.value = suggestion
				this.datalist.appendChild(option)
			}
		})
		this.suggest.suggest(this.input.value)
	}
}

function clear_element(element: HTMLElement) {
	element.replaceChildren()
}
