import { CSSProperties, MouseEvent, useRef, useState } from "react"
import { ContainerProperties } from "./container.props"

const styles = {
	container: {
		position: 'fixed',
		inset: 0,
		backgroundColor: 'rgba(0, 0, 0, .05)',

		display: 'grid',
		placeItems: 'center'
	},
	content: {
		position: 'relative',
		padding: '2rem',
		backgroundColor: 'white',
		borderRadius: '.25rem',
		boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px'
	}
} as { [key: string]: CSSProperties }

type ModalProperties = ContainerProperties & { onDismiss?: () => void }

export default function Modal({ className, children, onDismiss }: ModalProperties) {
	const container = useRef(null as HTMLDivElement | null)
	const [mousedown, setMouseDown] = useState(null as HTMLElement | EventTarget | null)
	const handle_dismiss = ({ target }: MouseEvent) => {
		if (target === container.current && mousedown === target)
			onDismiss?.()
	}
	return (
		<div ref={container} style={styles.container} onMouseDown={({ target }) => setMouseDown(target)} onMouseUp={handle_dismiss}>
			<div style={styles.content} className={className}>
				{children}
			</div>
		</div>
	)
}