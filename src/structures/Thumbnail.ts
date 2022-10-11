import { APIContentThumbnail } from "@ifunny/ifunny-api-types";

export class Thumbnail {
	protected _thumb: APIContentThumbnail;
	constructor(thumbnail: APIContentThumbnail) {
		this._thumb = thumbnail;
	}

	protected get<K extends keyof APIContentThumbnail>(key: K): APIContentThumbnail[K] {
		return this._thumb[key];
	}

	get largeUrl() {
		return this.get("large_url");
	}

	get largeWebpUrl() {
		return this.get("large_webp_url");
	}

	get proportionalSize() {
		return this.get("proportional_size");
	}

	get proportionalUrl() {
		return this.get("proportional_url");
	}

	get proportionalWebpUrl() {
		return this.get("proportional_webp_url");
	}

	get smallUrl() {
		return this.get("small_url");
	}

	get url() {
		return this.get("url");
	}

	get webpUrl() {
		return this.get("webp_url");
	}

	get x640Url() {
		return this.get("x640_url");
	}

	get x640WebpUrl() {
		return this.get("x640_webp_url");
	}
}
