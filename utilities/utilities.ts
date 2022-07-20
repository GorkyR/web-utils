export function matches<T>(item: T, term: string): boolean {
   if (!item) return false;
   if (!term) return true;

   term = term.toLowerCase();
   switch (typeof item) {
      case 'string':
         return item.toLowerCase().includes(term)
      case 'number': case 'bigint':
         let str = item.toString();
         if (!str.includes('.'))
            str += '.00';
         return str.includes(term);
      case 'object':
         if (Array.isArray(item))
            return item.some(o => matches(o, term));
         return Object.values(item).some(v => matches(v, term));
      case 'boolean':
         return item.toString() === term;
      default:
         return false;
   }
}

export function debounce<F extends (...args: any[]) => void>(callback: F, delay_in_milliseconds: number): (...args: Parameters<F>) => void {
	let timeout: any;
	return (...args: Parameters<F>) => {
		if (timeout)
			clearTimeout(timeout);

		timeout = setTimeout(() => {
			callback(...args);
		}, delay_in_milliseconds);
	};
}

export function throttle<F extends (...args: any[]) => void>(callback: F, delay_in_milliseconds: number): (...args: Parameters<F>) => void {
	let blocked: boolean = false;
   let waiting_args: Parameters<F> | null;
   let check = () => {
      if (waiting_args) {
         callback(...waiting_args);
         waiting_args = null;
         setTimeout(check, delay_in_milliseconds);
      } else blocked = false;
   }
	return (...args: Parameters<F>) => {
		if (blocked) {
         waiting_args = args;
         return;
      }

		callback(...args);
		blocked = true;
		setTimeout(check, delay_in_milliseconds);
	};
}

export function copy_to_clipboard(text: string) {
	window.navigator.clipboard.writeText(text)
}