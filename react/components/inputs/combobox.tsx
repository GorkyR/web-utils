import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FocusEvent, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { cx } from '../../utilities/react.utilities'
import { matches } from '../../utilities/utilities'
import { Child } from '../containers/container.props'
import styles from './combobox.module.css'

interface ComboboxProperties<T> {
	className?: string
	items: T[]
	value?: T
	display?: (item: T) => string
	onChange?: (selected: T | undefined) => void
	children?: (item: T, focused?: boolean, selected?: boolean) => Child
}
export default function Combobox<T>({ className, items, value, onChange, display, children: renderer }: ComboboxProperties<T>) {
	const [filter, setFilter] = useState('')
	const [showItems, setShowItems] = useState(false)
	const [selected, setSelected] = useState(null as number | null)
	const [hovered, setHovered] = useState(null as number | null)
	const container_ref = useRef(null as HTMLDivElement | null)
	function select(item: T | undefined) {
		onChange?.(item)
		setFilter('')
		setShowItems(false)
		setSelected(null)
	}
	function handle_blur({ target, relatedTarget }: FocusEvent<HTMLDivElement>) {
		const { current: container } = container_ref
		if (!relatedTarget || !container?.contains(relatedTarget))
			setShowItems(false)
	}
	const filtered_items = items.filter(item => matches(item, filter))
	function handle_keys(event: React.KeyboardEvent) {
		const { key } = event
		switch (key) {
			case 'ArrowDown':
				setSelected(s => Math.min(filtered_items.length - 1, (s ?? -1) + 1))
				break
			case 'ArrowUp':
				setSelected(s => Math.max(0, (s ?? filtered_items.length) - 1))
				break
			case 'Enter':
				event.preventDefault()
				if (selected != null && filtered_items.length)
					select(filtered_items[selected])
				break
		}
		console.debug(selected)
	}
	function wrapped_renderer(item: T, focused: boolean, selected: boolean) {
		const render = renderer?.(item, focused, selected) ?? display?.(item);
		if (typeof render === 'string')
			return <div className={cx({ [styles.focused]: focused, [styles.selected]: selected })}>{render}</div>
		return render
	}
	return (
		<div ref={container_ref} className={cx(styles.combobox, className)}>
			<input 
				type="text" 
				value={filter} 
				placeholder={value? display?.(value) : undefined}
				onFocus={() => { setShowItems(true); setSelected(null) }} 
				onBlur={handle_blur} 
				onChange={({ target: { value }}) => setFilter(value)}
				onKeyDown={handle_keys}
			/>
			{value? 
				<FontAwesomeIcon icon={['far', 'circle-xmark']} onClick={() => select(undefined)} tabIndex={-1}/> 
			: null}
			<FontAwesomeIcon icon="chevron-down" onClick={() => setShowItems(true)} tabIndex={-1}/>

			{showItems && <div className={styles.items}>
				{filtered_items.map((item, index) => 
					<div
						key={display?.(item)}
						className={styles.item}
						onClick={() => select(item)} tabIndex={-1}
						onMouseEnter={() => setHovered(index)}
						onMouseLeave={() => setHovered(null)}
					>
						{ wrapped_renderer?.(item, selected === index || hovered === index, value === item) }
					</div>
				)}
			</div>}
		</div>
	)
}