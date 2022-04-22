import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
	name: 'paginate'
})
export class PaginatePipe<T> implements PipeTransform {
	transform(collection: T[], items_per_page: number, page: number): T[] {
		if (!items_per_page)
			return collection;
		if (page > collection?.length / items_per_page)
			page = Math.floor(collection?.length / items_per_page) - 1;
		return collection?.slice(items_per_page * page, items_per_page * (page + 1));
	}
}