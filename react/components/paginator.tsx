import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ChangeEvent, CSSProperties, useState } from "react"
import { range } from "../utilities/utilities"

interface PageSizerProperties {
	name?: string
	fem?: boolean
	size?: number
	onChange?: (size: number) => void

	className?: string
}

export function PageSizer({ name, fem, size, onChange, className }: PageSizerProperties) {
	const sizes = [5, 10, 25, 50, 100, 0]
	function change_size({ target: { value } }: ChangeEvent<HTMLSelectElement>) {
		const size = Number(value)
		onChange?.(size)
	}
	name ??= 'elementos'
	return (
		<div className={className}>
			Mostrar <select value={size} onChange={change_size} style={{ borderBottom: '1px solid rgba(0, 0, 0, .2)'}}>
				{sizes.map(size => 
					<option key={size} value={size}>{ size ? size : fem? 'Todas' : 'Todos' }</option>
				)}
			</select> {size? `${name} por página` : (fem? 'las ' : 'los ') + name}
		</div>
	)
}


function titlecase(text: string): string {
	if (!text.trim().length) return ''
	return text.trim().split(' ').filter(_ => _)
	.map(word => word[0].toUpperCase() + word.substring(1).toLowerCase())
	.join(' ')
}

interface PaginatorProperties {
	name?: string
	page_size: number
	count: number
	show?: 5 | 7 | 9
	page?: number
	onChange?: (page: number) => void

	className?: string
}
export function Paginator(props: PaginatorProperties) {
	props.name ??= 'elementos'

	const show = props.show ?? 5
	const page = props.page ?? 0
	const page_count =  Math.ceil(props.count / props.page_size)

	function pages(): number[] {
		const hsc = Math.floor(show * .5)
		if (page <= hsc)
			return range(0, Math.min(show, page_count))
		if (page >= (page_count - hsc))
			return range(page_count - show, page_count)
		return range(page - hsc, page + hsc + 1)
	}
	const button_style: CSSProperties = {
		width: '1.75rem',
		border: '1px solid rgba(0, 0, 0, .2)'
	}
	const selected_style: CSSProperties = {
		backgroundColor: 'rgba(0, 0, 0, .15)'
	}
	return (
		<div className={props.className} style={{ display: 'flex', flexDirection: 'row' }}>
			<div style={{ flex: '1 1 0%' }}>
				{ props.page_size
				? `${titlecase(props.name)} ${props.page_size * page + 1}–${Math.min(props.page_size * (page + 1), props.count)}`
				: `${props.count} ${props.name}` }
			</div>
			{props.page_size? 
			<div>
				<button 
					style={button_style}
					onClick={() => props.onChange?.(Math.max(page - 1, 0))} 
				>
					<FontAwesomeIcon icon="chevron-left"/>
				</button>
				{pages().map(page => 
					<button
						key={page}
						style={{...button_style, ...(props.page === page? selected_style : {})}}
					>
						{ page + 1 }
					</button>
				)}
				<button
					style={button_style}
					onClick={() => props.onChange?.(Math.min(page + 1, page_count - 1))} 
				>
					<FontAwesomeIcon icon="chevron-right"/>
				</button>
			</div> : null}
		</div>
	)
}

export function usePagination(name?: string, fem: boolean = false): [
	React.FC<{ className?: string }>, 
	React.FC<{ className?: string, count: number }>, 
	{ start: number, end: number }
] {
	const [pageSize, setPageSize] = useState(10)
	const [page, setPage] = useState(0)
	return [
		({ className }) => <PageSizer className={className} name={name} fem={fem} size={pageSize} onChange={setPageSize}/>,
		({ className, count }) => <Paginator className={className} name={name} page_size={pageSize} page={page} count={count} onChange={setPage}/>,
		pageSize? { start: pageSize * page, end: pageSize * (page + 1) } : { start: 0, end: Number.POSITIVE_INFINITY }
	]
}