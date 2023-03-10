import React, { useContext, useEffect, useState } from "react"

import styles from "./printer.module.scss"

type Child = undefined | null | boolean | number | string | JSX.Element
type PrintFunction = (content?: Child | Child[]) => void

const PrinterContext: React.Context<{ print: PrintFunction }> = React.createContext({
   print: (..._) => {},
})

const usePrint = (): PrintFunction => useContext(PrinterContext).print

export default function Printer({ children }: { children: Child | Child[] }) {
   const [state, setState] = useState({ printing: false, content: null as Child | Child[] | null })
   useEffect(() => {
      if (!state.printing) return
      const stamp = Date.now()
      window.print()
      setTimeout(
         () => setState({ printing: false, content: null }),
         Date.now() - stamp <= 500 ? 10_000 : 0
      )
   }, [state.printing])
   function print(content?: Child | Child[]) {
      setState({ printing: true, content })
   }
   return (
      <PrinterContext.Provider value={{ print }}>
         {state.content != null && <section className={styles.printable}>{state.content}</section>}
         <section className={state.content != null ? styles.non_printable : undefined}>
            {children}
         </section>
      </PrinterContext.Provider>
   )
}

export { PrinterContext, Printer, usePrint }
