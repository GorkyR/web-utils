import { cx } from "../utilities/react.utilities";

export default function CurrencyCell({ amount, prefix, className }: { amount: number, prefix: string, className?: string }) {
	return (<>
		<td className={cx('currency', className)}>{prefix}</td>
		<td className={cx('currency', className)}>{amount?.toFixed(2)}</td>
		<td className={className}/>
	</>)
}