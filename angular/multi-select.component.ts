import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'multi-select',
	template: `
		<div class="multi-select" (focusin)="show = true" (focusout)="handle_focusout($event)">
			<input [(ngModel)]="item_filter" class="filter-input" [placeholder]="message">
			<div *ngIf="_selected.length > 0" tabindex="-1" class="clear" (click)="clear()">
				<span>×</span>
			</div>

			<div *ngIf="show" class="multi-items">
				<div *ngFor="let item of items | filter:item_filter" tabindex="-1" class="item" [class.selected]="_selected.includes(item)" (click)="toggle(item)">
					{{ format_item(item) }}
				</div>
			</div>
		</div>
	`,
	styles: [
		`.multi-select {
			position: relative;
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			align-items: center;
			min-width: 230px;
			width: 100%;

			border: 1px solid rgba(0, 0, 0, .2);
			border-radius: .25rem;
		}`,
		`.multi-select > .clear {
			min-height: 0;
			width: 1rem;
			aspect-ratio: 1/1;
			position: relative;
			text-align: center;
			border-radius: 50%;
			background-color: rgba(0, 0, 0, .3);
			cursor: pointer;
			margin-inline-end: .5rem;
		}`,
		`.multi-select > .clear > span {
			text-align: center;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			color: white;
			font-weight: 500;
		}`,
		`.multi-select > .filter-input {
			min-width: 0;
			flex: 1 1 0%;
		}`,
		`.multi-select > .multi-items {
			position: absolute;
			top: 100%;
			background-color: white;
			min-width: 100%;
			max-height: 200px;
			overflow-y: auto;
			box-shadow: 0 10px 10px rgba(0,0,0,.1);
		}`,
		`.multi-select > .multi-items > .item {
			padding-inline: .5rem;
			cursor: pointer;
		}`,
		`.multi-select > .multi-items > .item:hover {
			background-color: rgba(0, 0, 0, .05);
		}`,
		`.multi-select > .multi-items > .item.selected {
			background-color: rgba(0, 0, 0, .1);
		}`,
	]
})
export class MultiSelectComponent<T> {
	constructor() { }
	@Input() for: string = "elementos";
	@Input() items: T[] = [];
	@Input() set string(format: string) {
		const format_keys = ([...format.matchAll(/\{(\w+)\}/g)]
			.map(({1: key, index}) => ({ key, index }))
			.reverse() as any) as { key: (keyof T), index: number }[];
		this.format_item = (item: T): string => {
			return format_keys.reduce((output, { key, index }) => 
				output.substring(0, index) + item[key].toString() + output.substring(index + (key as string).length + 2)
			, format);
		}
	}
	format_item: (item: T) => string = item => item.toString();

	_selected: T[] = [];
	@Output() selected = new EventEmitter<T[]>();

	show: boolean = false;
	item_filter: string = null;

	get message(): string {
		if (!this._selected?.length)
			return `Seleccionar ${this.for}...`;
		return `${this._selected.length} ${this.for} seleccionado(s)`;
	}

	toggle(item: T) {
		const index = this._selected.indexOf(item);
		if (index >= 0)
			this._selected.splice(index, 1);
		else
			this._selected.push(item);
		this.selected.emit(this._selected);
	}

	clear() {
		this._selected = [];
		this.selected.emit(this._selected);
	}

	handle_focusout(event: FocusEvent) {
		if (!event.relatedTarget ||
			!(event.currentTarget as HTMLElement).contains(event.relatedTarget as HTMLElement)) {
			this.show = false;
			this.item_filter = null;
		}
	}
}
