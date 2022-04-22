import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'chunk' })
export class SplitPipe<T> implements PipeTransform {
	transform(collection: T[], count: number): T[][] {
		if (collection?.length <= count)
			return collection?.map(item => [item]) ?? [];
		const chunk_size = Math.ceil(collection.length / count);
		const chunks: T[][] = [];
		for (let i = 0; i < collection.length; i += chunk_size)
			chunks.push(collection.slice(i, i + chunk_size));
		return chunks;
	}
}