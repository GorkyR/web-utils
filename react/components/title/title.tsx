import { useEffect } from "react";

export function useTitle(title: string) {
	useEffect(() => {
		const previous_title = document.title
		document.title = title
		return () => { document.title = previous_title }
	}, [])
}

export default function Title({ children: title }: { children: string }) {
	useTitle(title)
	return <></>
}