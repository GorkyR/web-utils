import { ContainerProperties } from "../container.props"

export default function TableLayout({ className, children }: ContainerProperties) {
	return (
		<table className={className}>
			<tbody>
				{children}
			</tbody>
		</table>
	)
}