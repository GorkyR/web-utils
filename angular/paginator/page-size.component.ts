import { Component, Input } from "@angular/core";

@Component({
	selector: 'page-size',
	template: `<div>
		<span>Mostrar </span>
		<select [(ngModel)]="size">
			<option *ngFor="let s of sizes" [value]="s">{{ s? s : feminine? 'Todas' : 'Todos' }}</option>
		</select>
		<span *ngIf="size != 0"> {{ for }} por página</span>
		<span *ngIf="size == 0"> {{ feminine? 'las' : 'los' }} {{ for }}</span>
	</div>`
})
export class PageSizeComponent {
	@Input() for = 'elementos';
	feminine = false;
	@Input() set fem(value: string | boolean) {
		if (typeof value === 'boolean')
			this.feminine = value;
		this.feminine = true;
	}
	@Input() sizes = [5, 10, 25, 50, 100, 0];

	public _size = 10;
	public get size(): number {
		return this._size;
	}
	public set size(value: number) {
		this._size = Number(value);
	}
}