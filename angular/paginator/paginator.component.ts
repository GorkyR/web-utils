import { Component, Input } from "@angular/core";
import { range } from "../utilities";

@Component({
	selector: 'paginator',
	template: `<div class="paginator-container">
		<div class="paginator-legend" *ngIf="count && page_size != 0">{{ for | titlecase }} {{ page_size * page + 1 }}–{{ min(page_size * (page + 1), count) }} de {{ count? count : 0 }}</div>
		<div class="paginator-legend" *ngIf="!count || page_size == 0">{{ count? count : 0 }} {{ for }}</div>
		<div class="paginator-controller">
			<button (click)="page = max(0, page - 1)">{{ '<' }}</button>
			<ng-container *ngFor="let p of bar">
				<button *ngIf="page !== p - 1" (click)="page = p - 1">{{ p }}</button>
				<input *ngIf="page === p - 1" type="number" [value]="p" (change)="handle_input($event)"/>
			</ng-container>
			<button (click)="page = min(page_count - 1, page + 1)">{{ '>' }}</button>
		</div>
	</div>`,
	styles: [
		`:host { display: block; }`,
		'.paginator-container { width: 100%; display: flex; flex-direction: row; }',
		'.paginator-container > .paginator-legend { flex: 1 1 0%; }',
		'.paginator-container > .paginator-controller { display: flex; flex-direction: row; }',
		`.paginator-container > .paginator-controller > button, .paginator-container > .paginator-controller > input {
			border: 1px solid rgba(0, 0, 0, .15);
			width: 1.75rem;
		}`,
		`.paginator-container > .paginator-controller > button:first-child {
			border-top-left-radius:    .25rem;
			border-bottom-left-radius: .25rem;
		}`,
		`.paginator-container > .paginator-controller > button:last-child {
			border-top-right-radius:    .25rem;
			border-bottom-right-radius: .25rem;
		}`,
		`.paginator-container > .paginator-controller > input {
			background-color: lightblue;
			padding: 0;
			text-align: center;
			-moz-appearance: textfield;
		}`,
		'.paginator-container > .paginator-controller > input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0 }',
		'.paginator-container > .paginator-controller > input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0 }',
	]
})
export class PaginatorComponent {
	@Input() page_size = 10;
	@Input() count = 0;
	@Input() for = 'elementos';
	@Input() show: 3 | 5 | 7 = 5;
	public _page = 0;
	public get page(): number {
		return this._page;
	}
	public set page(value: number) {
		this._page = Number(value);
	}

	min(...args: number[]) {
		return Math.min(...args);
	}
	max(...args: number[]) {
		return Math.max(...args);
	}

	get page_count(): number {
		return Math.ceil(this.count / this.page_size);
	}
	get bar(): number[] {
		const pages = this.page_count;
		if (pages <= this.show)
			return range(1, pages + 1);
		const hps = Math.floor(this.show / 2);
		if (this.page <= hps)
			return range(1, this.show + 1);
		if (this.page >= pages - hps)
			return range(pages - this.show + 1, pages + 1);
		return range(this.page - hps + 1, this.page + hps + 2);
	}

	handle_input(event: Event) {
		this.page = Math.min(this.page_count - 1, Math.max(0, Number((event.target as HTMLInputElement).value) - 1));
	}
}	