export type Child = undefined | null | boolean | number | string | JSX.Element
export interface ContainerProperties {
	className?: string
	children?: Child | Child[]
}