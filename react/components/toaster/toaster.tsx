import styles from './toaster.module.scss'

import React, { useContext, useState } from "react"
import { ContainerProperties } from "../container.props"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { cx, swx } from '../../utilities/react.utilities'

type ToastType = 'success' | 'warning' | 'info' | 'error'
type Toast = {
	id: number,
	type: ToastType,
	message: string,
}
export type ToastFunction = (type: ToastType, message: string, duration_in_milliseconds?: number | 'keep') => void

const ToasterContext: React.Context<{ toast: ToastFunction }> = React.createContext({ toast: (..._) => { } })

interface ToasterProperties {
	top?: boolean
	bottom?: boolean
	left?: boolean
	right?: boolean
	center?: boolean
}
function Toaster({ children, className, top, bottom, left, center, right }: ContainerProperties & ToasterProperties) {
	const [toasts, setToasts] = useState([] as Toast[])

	const toast: ToastFunction = (type, message, duration = 5_000) => {
		const toast = { type, message, id: Date.now() }
		setToasts(toasts => [...toasts, toast])
		if (duration === 'keep' || duration === Number.POSITIVE_INFINITY)
			return
		setTimeout(() => {
			setToasts(toasts => toasts.filter(t => t !== toast))
		}, duration)
	}

	const toast_styles: { [key in ToastType]: string } = {
		'success': styles.success,
		'warning': styles.warning,
		'info': styles.info,
		'error': styles.error
	}

	return (
		<section className={cx(styles.toaster, className)}>
			<ToasterContext.Provider value={{toast}}>
				{children}
			</ToasterContext.Provider>
			<section 
				className={cx(styles.toasts, { 
					[styles.top]:    top, 
					[styles.bottom]: bottom, 
					[styles.left]:   left, 
					[styles.center]: center, 
					[styles.right]:  right
				})}
			>
				{toasts.map(toast =>
					<div key={toast.id} className={cx(styles.toast, toast_styles[toast.type])}>
						<FontAwesomeIcon 
							icon="times" 
							className={styles.dismiss}
							onClick={() => setToasts(toasts => toasts.filter(t => t != toast))}/>
						<FontAwesomeIcon 
							className="icon"
							icon={swx(toast.type, {
								error: ['far', 'circle-xmark'],
								info: 'circle-info',
								warning: 'triangle-exclamation',
								success: 'circle-check'
							}, 'circle-info') } />
						<p>{toast.message}</p>
					</div>
				)}
			</section>
		</section>
	)
}

const useToast = (): ToastFunction => useContext(ToasterContext).toast

export default Toaster
export { ToasterContext, Toaster, useToast }