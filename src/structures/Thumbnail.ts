import { APIContentThumbnail } from "@ifunny/ifunny-api-types";

export class Thumbnail {
	protected _thumb: APIContentThumbnail;
	constructor(thumbnail: APIContentThumbnail) {
		this._thumb = thumbnail;
	}

	protected get<K extends keyof APIContentThumbnail>(key: K): APIContentThumbnail[K] {
		return this._thumb[key];
	}
}
