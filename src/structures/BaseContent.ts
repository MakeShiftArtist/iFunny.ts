import { Base } from "./Base";
import Client from "../client/Client";
import { Creator } from "./Creator";
import {
	CONTENT_TYPE,
	APIContent,
	APIContentData,
	APIContentType,
	Endpoints,
} from "@ifunny/ifunny-api-types";

/**
 * The Base Content that all Content Types will extend
 */
export class BaseContent extends Base<APIContent> {
	#creator: Creator | null = null;

	constructor(client: Client, payload: APIContent) {
		super(client, payload);
		this.endpoint_url = Endpoints.content(payload.id);
		this.payload = payload;
	}

	/**
	 * This data is typically retrieved by using the content's type as a key for the content.
	 * @example
	 * content[content.type] // Key isn't always the type
	 */
	get data(): APIContentData {
		switch (this.payload.type) {
			case CONTENT_TYPE.VIDEO_CLIP:
				return this.payload.video_clip;
			case CONTENT_TYPE.VIDEO:
				return this.payload.video;
			case CONTENT_TYPE.VINE:
				return this.payload.vine;
			case CONTENT_TYPE.COUB:
				return this.payload.coub;
			case CONTENT_TYPE.GIF:
			case CONTENT_TYPE.GIF_CAPTION:
				return this.payload.gif;
			case CONTENT_TYPE.CAPTION:
				return this.payload.caption;
			case CONTENT_TYPE.PIC:
				return this.payload.pic;
			case CONTENT_TYPE.MEME:
				return this.payload.mem;
			case CONTENT_TYPE.COMICS:
				return this.payload.comics;
			case CONTENT_TYPE.APP:
			case CONTENT_TYPE.OLD:
			case CONTENT_TYPE.DEM:
			default:
				// @ts-ignore
				return this.payload[this.payload.type]; // ? Currently undocumented datas
		}
	}

	/**
	 * Content background color
	 */
	get bgColor() {
		return this.get("bg_color");
	}

	/**
	 * Can the post be boosted?
	 */
	get canBeBoosted() {
		return this.get("can_be_boosted");
		// ^?
	}

	/**
	 * Content url that can be opened in app
	 */
	get canonicalUrl() {
		return this.get("canonical_url");
	}

	/**
	 * Copywright information attached to the content
	 */
	get copyright() {
		return this.get("copyright") ?? {};
	}

	/**
	 * The creator of the post
	 */
	get creator() {
		if (this.#creator) return this.#creator;
		const user = this.get("creator");
		return user ? (this.#creator ??= new Creator(this.client, user)) : user;
	}

	/**
	 * Timestamp of when the content was created
	 */
	get createdAtTimestamp() {
		const ms = this.get("date_create");
		return ms ? ms * 1000 : ms;
	}

	/**
	 * When the content was created
	 */
	get createdAt() {
		return new Date(this.createdAtTimestamp);
	}

	/**
	 * Not sure what this is
	 */
	get fastStart() {
		return this.get("fast_start");
	}

	/**
	 * Title set by iFunny
	 */
	get fixedTitle() {
		return this.get("fixed_title");
	}

	/**
	 * The ID of the Content.
	 */
	override get id(): string {
		return super.id;
	}

	/**
	 * Was the post removed by iFunny
	 */
	get isAbused() {
		return this.get("is_abused");
	}

	/**
	 * Was the post featured
	 */
	get isFeatured() {
		return this.get("is_featured");
	}

	/**
	 * Is the Content pinned by the author
	 */
	get isPinned() {
		return this.get("is_pinned");
	}

	/**
	 * Is the Content republished by the Client
	 */
	get isRepublished() {
		return this.get("is_republished");
	}

	/**
	 * Is the Content smiled by the Client
	 */
	get isSmiled() {
		return this.get("is_smiled");
	}

	/**
	 * Timestamp of when the Content was Featured if it was featured
	 */
	get featuredAtTimestamp() {
		const ms = this.get("issue_at");
		return typeof ms === "number" ? ms * 1000 : ms;
	}

	/**
	 * When the Content was featured if it was featured
	 */
	get featuredAt() {
		const ms = this.featuredAtTimestamp;
		return ms ? new Date(ms) : null;
	}

	/**
	 * The link of the content that can be opened in iFunny
	 */
	get link() {
		return this.get("link");
	}

	/**
	 * The numbers attached to the Content
	 * @alias stats
	 */
	get num() {
		return this.get("num");
	}

	/**
	 * The numbers attached to the Content
	 * @alias num
	 */
	get stats() {
		return this.num;
	}

	/**
	 * Text generated from iFunny's OCR (Optical Character Recognition)
	 */
	get ocrText() {
		return this.get("ocr_text");
	}

	/**
	 * Does the Content use the Old Watermark
	 */
	get oldWatermark() {
		return this.get("old_watermark");
	}

	/**
	 * Timestamp of when the Content was published or will publish
	 */
	get publishedAtTimestamp() {
		const ms = this.get("publish_at");
		return typeof ms === "number" ? ms * 1000 : ms;
	}

	/**
	 * When the Content was published or will publish
	 */
	get publishedAt() {
		return new Date(this.publishedAtTimestamp);
	}

	/**
	 * The risk level of the Content\
	 * Default: `1`
	 */
	get risk() {
		return this.get("risk");
	}

	/**
	 * The shot status of the content\
	 * `approved` - Content can be posted in comments
	 * `shot` - Content can't be posted in comments
	 * `hardShot` - Content was removed by iFunny and is not viewable
	 */
	get shotStatus() {
		return this.get("shot_status");
	}

	/**
	 * The size of the Content
	 */
	get size() {
		return this.get("size");
	}

	/**
	 * The source of the content if it exists
	 */
	get source() {
		return this.get("source");
	}

	/**
	 * The state of the Content
	 */
	get state() {
		return this.get("state");
	}

	/**
	 * All tags on the Content
	 */
	get tags() {
		return this.get("tags");
	}

	/**
	 * Thumbnail of the Content
	 */
	get thumbnail() {
		return this.get("thumb");
	}

	/**
	 * The Title of the content
	 */
	get title() {
		return this.get("title");
	}

	/**
	 * URL of the original source if it exists
	 */
	get tracebackUrl() {
		return this.get("traceback_url");
	}

	/**
	 * The type of the post
	 */
	get type(): APIContentType {
		return this.get("type");
	}

	/**
	 * URL of the Content
	 */
	get url() {
		return this.get("url");
	}

	/**
	 * The Content's visibility status\
	 * `public` - Content shows up in collective and explore
	 * `subscribers` - Content is hidden from Collective and Explore
	 * `closed` - Content is not visible by anyone but the author
	 */
	get visibility() {
		return this.get("visibility");
	}
}
