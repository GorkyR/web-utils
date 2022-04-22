import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
	name: 'filter'
})
export class FilterPipe<T> implements PipeTransform {
	transform(collection: T[], term: string, keys?: (keyof T)[]) {
		if (keys)
			return collection.filter(item => matches(keys.map(key => item[key]), term));
		return collection.filter(item => matches(item, term));
	}
}

export function matches<T>(obj: T, term: string): boolean {
   if (!obj) return false;
   if (!term) return true;

   term = term.toLowerCase();
   switch (typeof obj) {
      case 'string':
         return obj.toLowerCase().includes(term);
      case 'number': case 'bigint':
         let str = obj.toString();
         if (!str.includes('.'))
            str += '.00';
         return str.includes(term);
      case 'object':
         if (Array.isArray(obj))
            return obj.some(o => matches(o, term));
         return Object.values(obj).some(v => matches(v, term));
      case 'boolean':
         return obj.toString() === term;
      default:
         return false;
   }
}