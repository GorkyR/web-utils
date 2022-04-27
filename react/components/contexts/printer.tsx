import React, { useContext, useEffect, useState } from "react";
import { Child } from "./containers/container.props";

type PrintFunction = (content?: Child | Child[]) => void

const PrinterContext: React.Context<{ print: PrintFunction }> = React.createContext({
	print: (..._) => {}
})

const usePrint = (): PrintFunction => useContext(PrinterContext).print

export default function Printer({ children }: { children: Child | Child[] }) {
	const [state, setState] = useState({ printing: false, content: null as Child | Child[] | null })
	useEffect(() => {
		if (!state.printing) return
		window.print()
		setState({ printing: false, content: null })
	}, [state.printing])
	function print(content?: Child | Child[]) {
		setState({ printing: true, content })
	}
	return (
		<PrinterContext.Provider value={{ print }}>
			{state.content != null && state.content}
			<section style={{ display: state.content? 'none' : undefined }}>
				{children}
			</section>
		</PrinterContext.Provider>
	)
}

export { PrinterContext, Printer, usePrint }