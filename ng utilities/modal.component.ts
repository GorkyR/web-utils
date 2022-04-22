import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
	selector: 'modal',
	template: `<div (click)="handle_click($event)" class="modal-container">
		<div class="modal-content">
			<ng-content></ng-content>
		</div>
	</div>`,
	styles: [
		`.modal-container {
			position: fixed;
			inset: 0 0 0 0;
			background-color: rgba(0 0 0 / .1);
			z-index: 50;
		}`,
		`.modal-container > .modal-content {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);

			padding: 2rem;
			border-radius: .5rem;
			background-color: white;

			box-shadow: 0 14px 28px rgba(0,0,0,.1), 0 10px 10px rgba(0,0,0,.1);
		}`
	]
})
export class ModalComponent {
	@Output() dismissed = new EventEmitter();

	handle_click(event: MouseEvent) {
		if (!(event.target as HTMLElement).closest('.modal-content'))
			this.dismissed.emit();
	}
}