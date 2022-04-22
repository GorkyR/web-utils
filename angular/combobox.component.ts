import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
	selector: 'combobox',
	template: `
	<div class="combobox-container" (focusin)="show = true" (focusout)="handle_focusout($event)">
		<input [(ngModel)]="item_filter" [class.selected]="selected" [placeholder]="selected? format_item(selected) : 'Seleccionar ' + for + '...'">
		<div *ngIf="selected" tabindex="-1" class="clear" (click)="select($event, null)">
			<span>×</span>
		</div>
		<span tabindex="-1" class="expander">⌄</span>

		<div *ngIf="show" class="combobox-items">
			<div *ngFor="let item of items | filter:item_filter" tabindex="-1" class="item" [class.selected]="item === selected" (click)="select($event, item)">{{ format_item(item) }}</div>
		</div>
	</div>`,
	styles: [
		`.combobox-container {
			border: 1px solid rgba(0, 0, 0, .2);
			border-radius: .25rem;

			position: relative;
			display: flex;
			flex-direction: row;
			align-items: center;
			padding-inline: .25rem;
		}`,
		`.combobox-container > input {
			min-width: 0;
			flex: 1 1 0%;
		}`,
		`.combobox-container > input.selected::placeholder {
			color: rgba(0, 0, 0, .7);
			font-weight: 450;
		}`,
		`.combobox-container > .clear {
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
		`.combobox-container > .clear > span {
			text-align: center;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			color: white;
			font-weight: 500;
		}`,
		`.combobox-container > .expander {
			vertical-align: middle;
			font-weight: 800;
			font-size: 1.25rem;
			line-height: 0;
			margin-top: -1rem;
			cursor: pointer;
		}`,
		`.combobox-container > .combobox-items {
			position: absolute;
			top: 100%;
			left:0;
			min-width: 100%;
			background-color: white;
			max-height: 200px;
			overflow-y: auto;
			box-shadow: 0 10px 10px rgba(0,0,0,.1);

		}`,
		`.combobox-container > .combobox-items > .item {
			cursor: pointer;
			padding-inline-start: .75rem;
		}`,
		`.combobox-container > .combobox-items > .item.selected {
			background-color: rgba(0,0,0,.2) !important;
		}`,
		`.combobox-container > .combobox-items > .item:hover {
			background-color: rgba(0,0,0,.1);
		}`
	]
})

export class ComboboxComponent<T> {
	@Input() for = 'elemento';
	@Input() items: T[];
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

	item_filter: string;

	show: boolean = false;

	@Input() selected: T;
	@Output() selectedChange = new EventEmitter<T>();

	select(event: MouseEvent, item: T) {
		this.selected = item;
		this.selectedChange.emit(this.selected);
		this.show = false;
		this.item_filter = null;
		event.stopPropagation();
	}

	handle_focusout(event: FocusEvent) {
		if (!event.relatedTarget ||
			!(event.currentTarget as HTMLElement).contains(event.relatedTarget as HTMLElement)) {
			this.show = false;
			this.item_filter = null;
		}
	}
}