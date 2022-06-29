import { CSSProperties } from "react"
import { cx } from "../utilities/react.utilities"
import styles from './busy.module.scss'

interface BusyProperties {
	className?: string
	style?: CSSProperties
	size?: number
	color?: string
	thickness?: number
	speed?: number
}
export default function Busy({ size, color, thickness, speed, className, style }: BusyProperties) {
	size ??= 1
	thickness ??= 1
	speed ??= 1
	return <div 
		className={cx('busy', styles.busy, className)} 
		style={{...style, 
			width: `${size}em`,
			borderTopColor: color ?? 'currentColor', 
			borderWidth: `calc(${size}em * .2 * ${thickness})`,
			animationDuration: `${.4 / speed}s`
		}}/>
}