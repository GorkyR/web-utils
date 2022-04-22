import { Directive, ElementRef, HostListener, Input } from "@angular/core";
import { NgModel } from "@angular/forms";

@Directive({
	selector: '[format]'
})
export class InputFormatterDirective {
	private element: HTMLInputElement;
	constructor(private eref: ElementRef, private model: NgModel) {
		this.element = eref.nativeElement;
	}

	@Input() format: string;
	get validators(): ((_: string) => boolean)[] {
		const validator_chars = Object.keys(validators);
		return [...this.format]
			.filter(f => validator_chars.includes(f))
			.map(f => validators[f]);
	}

	get constrained_value(): string {
		const value = this.element.value;
		const { value: constrained_value } = [...value].reduce(({ value, validators }, char) => {
			if (validators.length && validators[0](char))
				return { value: value + char, validators: validators.slice(1) };
			else
				return { value, validators };
		}, { value: '', validators: this.validators });
		return constrained_value;
	}

	@HostListener('input') handle_input() {
		let constrained_value = this.constrained_value;
		if (!constrained_value) {
			this.element.value = '';
			return;
		}
		const constrains = Object.keys(validators);
		let formatted_value = '';
		for (let f of this.format) {
			if (!constrained_value) break;

			if (!constrains.includes(f))
				formatted_value += f;
			else {
				formatted_value += constrained_value[0];
				constrained_value = constrained_value.substring(1);
			}
		}
		this.element.value = formatted_value;
		this.model?.viewToModelUpdate(formatted_value);
	}
}

const validators: { [char: string]: (char: string) => boolean } = {
	'#': _ => /[0-9]/.test(_),
	'a': _ => /[A-z]/.test(_),
	'.': _ => /[A-z0-9]/.test(_)
};