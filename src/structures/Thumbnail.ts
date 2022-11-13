import { APIContentThumbnail } from "@ifunny/ifunny-api-types";

/**
 * Represents a thumbnail for Content on iFunny
 */
export class Thumbnail {
	#thumb: APIContentThumbnail;

	static readonly Thumbnail_ID_Regex =
		/(?<=^https\:\/\/imageproxy\.ifunny\.co\/[a-z0-9:,-]+\/[a-z]+\/)([a-z0-9_]+)(?=\.[a-z]{3,4}$)/gi;

	/**
	 * @param thumbnail Thumbnail data from the API
	 */
	public constructor(thumbnail: APIContentThumbnail) {
		this.#thumb = thumbnail;
	}

	/**
	 * Gets the value for the thumbnail from its key
	 * @param key Key for the thumbnail
	 * @returns Type safe value from the key
	 */
	protected get<K extends keyof APIContentThumbnail>(key: K): APIContentThumbnail[K] {
		return this.#thumb[key];
	}

	/**
	 * Thumbnail Content Id. This is different from the Content Id
	 */
	public get id(): string {
		const id = this.url.match(Thumbnail.Thumbnail_ID_Regex);
		if (!id) {
			throw new Error(
				`Thumbnail Id Regex too specific. Couldn't get ID for: ${this.url}`
			);
		}
		return id[0];
	}

	/**
	 * Create a new thumbnail with custom parameters
	 * @param params Params for the new thumbnail
	 * @param extension File extension for the thumbnail. (Default: `jpg`)
	 */
	public create(params: string, extension: "jpg" | " webp" = "jpg") {
		return `https://imageproxy.ifunny.co/${params}/images/${this.id}.${extension}`;
	}

	/**
	 * The thumbnail url after cropping out the iFunny Watermark
	 */
	public get cropped() {
		return this.create("crop:x-20");
	}

	public get large_url() {
		return this.get("large_url");
	}

	public get large_webp_url() {
		return this.get("large_webp_url");
	}

	public get proportional_size() {
		return this.get("proportional_size");
	}

	public get proportional_url() {
		return this.get("proportional_url");
	}

	public get proportional_webp_url() {
		return this.get("proportional_webp_url");
	}

	public get small_url() {
		return this.get("small_url");
	}

	public get url() {
		return this.get("url");
	}

	public get webp_url() {
		return this.get("webp_url");
	}

	public get x640_url() {
		return this.get("x640_url");
	}

	public get x640_webp_url() {
		return this.get("x640_webp_url");
	}
}

export default Thumbnail;
