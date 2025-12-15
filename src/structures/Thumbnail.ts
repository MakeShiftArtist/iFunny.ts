import type { APIContentThumbnail, Size } from "@ifunny/ifunny-api-types";

/**
 * Represents a thumbnail for Content on iFunny
 */
export class Thumbnail {
    #thumb: APIContentThumbnail;

    /**
     * The regex used to find the thumbnail ID
     */
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
    protected get<K extends keyof APIContentThumbnail>(
        key: K,
    ): APIContentThumbnail[K] {
        return this.#thumb[key];
    }

    /**
     * Gets the ID of the thumbnail from its URL.
     * @throws An error if the ID cannot be found in the URL.
     * @returns The ID string.
     */
    public get id(): string {
        const id = this.url.match(Thumbnail.Thumbnail_ID_Regex);
        if (!id) {
            throw new Error(
                `Thumbnail Id Regex too specific. Couldn't get ID for: ${this.url}`,
            );
        }
        return id[0];
    }

    /**
     * Create a new thumbnail with custom parameters
     * @param params Params for the new thumbnail
     * @param extension File extension for the thumbnail. (Default: `jpg`)
     */
    public create(params: string, extension: "jpg" | " webp" = "jpg"): string {
        return `https://imageproxy.ifunny.co/${params}/images/${this.id}.${extension}`;
    }

    /**
     * The content url after cropping out the iFunny Watermark
     */
    public get cropped(): string {
        return this.create("crop:x-20");
    }
    /**
     * Gets the large image URL.
     * @returns The URL string or null if not available.
     */
    public get largeUrl(): string {
        return this.get("large_url") ?? null;
    }

    /**
     * Gets the large WebP image URL.
     * @returns The URL string or null if not available.
     */
    public get largeWebpUrl(): string {
        return this.get("large_webp_url") ?? null;
    }

    /**
     * Gets the proportional size of the image.
     * @returns The size object or null if not available.
     */
    public get proportionalSize(): Size {
        return this.get("proportional_size") ?? null;
    }

    /**
     * Gets the proportional image URL.
     * @returns The URL string or null if not available.
     */
    public get proportionalUrl(): string {
        return this.get("proportional_url") ?? null;
    }

    /**
     * Gets the proportional WebP image URL.
     * @returns The URL string or null if not available.
     */
    public get proportionalWebpUrl(): string {
        return this.get("proportional_webp_url") ?? null;
    }

    /**
     * Gets the small image URL.
     * @returns The URL string or null if not available.
     */
    public get smallUrl(): string | null {
        return this.get("small_url") ?? null;
    }

    /**
     * Gets the image URL.
     * @returns The URL string or null if not available.
     */
    public get url(): string {
        return this.get("url") ?? null;
    }

    /**
     * Gets the WebP image URL.
     * @returns The URL string or null if not available.
     */
    public get webpUrl(): string {
        return this.get("webp_url") ?? null;
    }

    /**
     * Gets the 640px wide image URL.
     * @returns The URL string or null if not available.
     */
    public get x640Url(): string {
        return this.get("x640_url") ?? null;
    }

    /**
     * Gets the 640px wide WebP image URL.
     * @returns The URL string or null if not available.
     */
    public get x640WebpUrl(): string {
        return this.get("x640_webp_url") ?? null;
    }
}

export default Thumbnail;
