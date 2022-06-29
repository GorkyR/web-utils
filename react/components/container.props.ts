import { CSSProperties } from "react"

export type Child = undefined | null | boolean | number | string | JSX.Element
export interface ContainerProperties {
	className?: string
	style?: CSSProperties
	children?: Child | Child[]
}