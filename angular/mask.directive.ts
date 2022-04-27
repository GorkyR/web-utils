import { Directive, ElementRef, HostListener, Input } from "@angular/core";
import { NgModel } from "@angular/forms";

@Directive({
	selector: '[mask]'
})
export class InputMaskerDirective {
	private element: HTMLInputElement;
	constructor(private eref: ElementRef, private model: NgModel) {
		this.element = eref.nativeElement;
	}

	@Input() mask: string;
	get validators(): ((_: string) => boolean)[] {
		return [...this.mask]
			.filter(m => m in masks)
			.map(f => masks[f]);
	}

	get unmasked_value(): string {
		const value = this.element.value;
		const { value: constrained_value } = [...value].reduce(({ value, validators }, char) => {
			if (validators.length && validators[0](char))
				return { value: value + char, validators: validators.slice(1) };
			else
				return { value, validators };
		}, { value: '', validators: this.validators });
		return constrained_value;
	}

	@HostListener('input') onInput() {
		let unmasked = this.unmasked_value;
		if (!unmasked) {
			this.element.value = '';
			return;
		}
		let formatted_value = '';
		for (let f of this.mask) {
			if (!unmasked) break;

			if (f in masks) {
				formatted_value += unmasked[0];
				unmasked = unmasked.substring(1);

			} else 
				formatted_value += f;
		}
		this.element.value = formatted_value;
		this.model?.viewToModelUpdate(formatted_value);
	}
}

const masks: { [char: string]: (char: string) => boolean } = {
	'#': _ => /[0-9]/.test(_),
	'a': _ => /[A-z]/.test(_),
	'.': _ => /[A-z0-9]/.test(_)
};