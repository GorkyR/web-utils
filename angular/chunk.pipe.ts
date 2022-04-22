import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'chunk' })
export class ChunkPipe<T> implements PipeTransform {
	transform(collection: T[], chunk_size: number): T[][] {
		if (collection?.length <= chunk_size)
			return [collection];
		const chunks: T[][] = [];
		for (let i = 0; i < collection.length; i += chunk_size)
			chunks.push(collection.slice(i, i + chunk_size));
		return chunks;
	}
}