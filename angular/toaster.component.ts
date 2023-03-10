import { Component, ElementRef, Input, ViewChild, ViewEncapsulation } from '@angular/core'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

@Component({
	selector: 'toaster',
	encapsulation: ViewEncapsulation.None,
	template: `
		<div #dock class="toast-dock from-{{ top_or_bottom }} from-{{ center_left_or_right }}" [class.showing]="toasts.length">
			<div *ngFor="let toast of toasts; let i = index" class="toast {{ toast.type }}" id="toast_{{ toast.id }}">
				<fa-icon [icon]="type_to_icon(toast.type)"></fa-icon>
				{{ toast.message }}
				<fa-icon icon="xmark" class="closer" (click)="toasts.splice(i, 1)"></fa-icon>
			</div>
		</div>
	`,
	styles: [
		`
			.toast-dock {
				display: none; // flex;
				position: fixed;
				z-index: 50;
				pointer-events: none;
			}

			.toast-dock.from-bottom {
				flex-direction: column-reverse;
				bottom: 0;
				padding-bottom: 50px;

				toast {
					@keyframes fadein {
						from {
							transform: translateY(50px);
							opacity: 0;
						}
						to {
							transform: translateY(0);
							opacity: 1;
						}
					}

					@keyframes fadeout {
						from {
							transform: translateY(0);
							opacity: 1;
						}
						to {
							transform: translateY(50px);
							opacity: 0;
						}
					}
				}
			}

			.toast-dock.from-top {
				flex-direction: column;
				top: 0;

				toast {
					@keyframes fadein {
						from {
							transform: translateY(-50px);
							opacity: 0;
						}
						to {
							transform: translateY(0);
							opacity: 1;
						}
					}

					@keyframes fadeout {
						from {
							transform: translateY(0);
							opacity: 1;
						}
						to {
							transform: translateY(-50px);
							opacity: 0;
						}
					}
				}
			}

			.toast-dock.from-center {
				left: 0;
				right: 0;
			}
			.toast-dock.from-left {
				left: 0;
			}
			.toast-dock.from-right {
				right: 0;
			}

			.toast-dock.showing {
				display: flex !important;
			}
		`,
		`
			.toast-dock .toast {
				display: block;
				color: #ffffff;
				font-weight: bold;
				text-align: center;
				white-space: pre-wrap;
				overflow-wrap: break-word;
				border-radius: 5px;
				position: relative;

				min-width: 250px;
				max-width: 500px;
				margin: 12px;
				padding: 16px;

				// border-radius: 10px;
				box-shadow: 0 0 37px rgba(8, 21, 66, 0.35);

				pointer-events: auto;

				animation: fadein 0.1s;
				&.dismiss {
					animation: fadeout 0.1s;
					opacity: 0;
				}
			}

			.toast-dock .toast.error {
				color: #dc2626;
				outline: 2px solid #dc2626;
			}
			.toast-dock .toast.success {
				color: #10b981;
				outline: 2px solid #10b981;
			}
			.toast-dock .toast.info {
				color: #38bdf8;
				outline: 2px solid #38bdf8;
			}
			.toast-dock .toast.warning {
				color: #f59e0b;
				outline: 2px solid #f59e0b;
			}
		`,
		`
			.toast-dock .toast .closer {
				display: none;
				position: absolute;
				top: 0.125rem;
				right: 0.25rem;
				cursor: pointer;
			}
			.toast-dock .toast .closer:hover {
				transform: scale(1.2);
			}
			.toast-dock .toast:hover .closer {
				display: inline;
			}
		`,
	],
})
export class ToasterComponent {
	top_or_bottom: 'top' | 'bottom' = 'bottom'
	center_left_or_right: 'center' | 'left' | 'right' = 'center'

	@Input() set top(value: string | boolean) {
		if (value === '' || value) this.top_or_bottom = 'top'
	}
	@Input() set bottom(value: string | boolean) {
		if (value === '' || value) this.top_or_bottom = 'bottom'
	}

	@Input() set center(value: string | boolean) {
		if (value === '' || value) this.center_left_or_right = 'center'
	}
	@Input() set left(value: string | boolean) {
		if (value === '' || value) this.center_left_or_right = 'left'
	}
	@Input() set right(value: string | boolean) {
		if (value === '' || value) this.center_left_or_right = 'right'
	}

	@ViewChild('dock') dock!: ElementRef<HTMLDivElement>

	toasts: Toast[] = []

	constructor() {
		toast = (type, message, duration = 3_000) => {
			const t: Toast = { message, type, id: Date.now().toString() + '_' + Math.floor(Math.random() * 100_000) }
			this.toasts.push(t)
			if (duration != 'keep' && duration != 0) setTimeout(() => this.toasts.splice(this.toasts.indexOf(t), 1), duration)
		}
	}

	type_to_icon(type: string): IconProp {
		switch (type) {
			case 'error':
				return 'circle-xmark'
			case 'info':
				return 'circle-info'
			case 'success':
				return 'circle-check'
			case 'warning':
				return 'exclamation-triangle'
		}
		return 'message'
	}
}

interface Toast {
	id: string
	message: string
	type: 'success' | 'error' | 'warning' | 'info'
}

export enum ToastType {
	Error = 'error',
	Warning = 'warning',
	Success = 'success',
	Info = 'info',
}

export type ToastFunction = (type: ToastType | `${ToastType}`, message: string, duration_in_milliseconds?: number | 'keep') => void

export let toast: ToastFunction = () => {}
