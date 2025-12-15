import {
    ContentType,
    Endpoints,
    type APIContent,
    type APIContentCopyright,
    type APIContentData,
    type APIContentNums,
    type APIContentShotStatus,
    type APIContentSource,
    type APIContentState,
    type APIContentThumbnail,
    type APIContentType,
    type APIContentVisibility,
    type APIFeedFrom,
    type Size,
} from "@ifunny/ifunny-api-types";
import { Base } from "./Base";
import { Creator } from "./Creator";
import type { Client } from "../client/Client";

/**
 * The Base Content that all Content Types will extend
 * @extends Base<APIContent>
 */
export class BaseContent extends Base<APIContent> {
    #creator: Creator | null = null;

    /**
     * @param client Client instance associated with the Content
     * @param payload Payload of the Content
     */
    public constructor(client: Client, payload: APIContent) {
        super(client, payload);
        this.endpointUrl = Endpoints.content(payload.id);
        this.payload = payload;
    }

    /**
     * This data is typically retrieved by using the content's type as a key for the content.
     * @example
     * content.payload[content.type] // Key isn't always the type
     */
    public get data(): APIContentData | null {
        switch (this.payload.type) {
            case ContentType.VIDEO_CLIP:
                return this.payload.video_clip ?? null;
            case ContentType.VIDEO:
                return this.payload.video ?? null;
            case ContentType.VINE:
                return this.payload.vine ?? null;
            case ContentType.COUB:
                return this.payload.coub ?? null;
            case ContentType.GIF:
            case ContentType.GIF_CAPTION:
                return this.payload.gif ?? null;
            case ContentType.CAPTION:
                return this.payload.caption ?? null;
            case ContentType.PIC:
                return this.payload.pic ?? null;
            case ContentType.MEME:
                return this.payload.mem ?? null;
            case ContentType.COMICS:
                return this.payload.comics ?? null;
            case ContentType.APP:
                return this.payload.app ?? null;
            case ContentType.OLD:
            case ContentType.DEM:
            default:
                // @ts-ignore
                return this.payload[this.payload.type] ?? null; // ? Currently undocumented datas
        }
    }

    /**
     * The creator of the post
     * Alias for {@link creator}
     */
    get author(): Creator | null {
        return this.creator;
    }

    /**
     * Content background color
     */
    public get bgColor(): string | null {
        return this.get("bg_color");
    }

    /**
     * Can the post be boosted?
     */
    public get canBeBoosted(): boolean {
        return this.get("can_be_boosted");
    }

    /**
     * Content url that can be opened in app
     */
    public get canonicalUrl(): string {
        return this.get("canonical_url");
    }

    /**
     * Copywright information attached to the content
     */
    public get copyright(): APIContentCopyright {
        return this.get("copyright") ?? {};
    }

    /**
     * The creator of the post
     * Alias for {@link author}
     */
    public get creator(): Creator | null {
        if (this.#creator) return this.#creator;
        const user = this.get("creator");
        return user ? (this.#creator ??= new Creator(this.client, user)) : user;
    }

    /**
     * When the content was created
     */
    public get createdAt(): Date {
        return new Date(this.get("date_create") * 1000);
    }

    /**
     * Not sure what this is
     */
    public get fastStart(): boolean {
        return this.get("fast_start");
    }

    /**
     * Title set by iFunny
     */
    public get fixedTitle(): string | null {
        return this.get("fixed_title");
    }

    /**
     * The ID of the Content.
     */
    public override get id(): string {
        return super.id;
    }

    /**
     * Was the post removed by iFunny?
     */
    public get isAbused(): boolean {
        return this.get("is_abused");
    }

    /**
     * Was the post featured?
     */
    public get isFeatured(): boolean {
        return this.get("is_featured");
    }

    /**
     * Is the Content pinned by the author?
     */
    public get isPinned(): boolean {
        return this.get("is_pinned");
    }

    /**
     * Is the Content republished by the Client?
     */
    public get isRepublished(): boolean {
        return this.get("is_republished");
    }

    /**
     * Is the Content smiled by the Client?
     */
    public get isSmiled(): boolean {
        return this.get("is_smiled");
    }

    /**
     * When the Content was featured if it was featured
     */
    public get featuredAt(): Date | null {
        const ms = this.get("issue_at");
        return ms ? new Date(ms * 1000) : null;
    }

    /**
     * The tag to use for the 'from' parameter
     */
    public get ftag(): APIFeedFrom | null {
        return this.get("ftag");
    }

    /**
     * The link of the content that can be opened in iFunny
     */
    public get link(): string {
        return this.get("link");
    }

    /**
     * The numbers attached to the Content
     * Alias for {@link stats}
     */
    public get num(): APIContentNums {
        return this.get("num");
    }

    /**
     * Text generated from iFunny's OCR (Optical Character Recognition)
     */
    public get ocrText(): string | null {
        return this.get("ocr_text");
    }

    /**
     * Does the Content use the Old Watermark
     */
    public get oldWatermark(): boolean {
        return this.get("old_watermark");
    }

    /**
     * When the Content was published or will publish
     */
    public get publishedAt(): Date {
        const seconds = this.get("publish_at") * 1000;
        return new Date(seconds);
    }

    /**
     * The risk level of the Content\
     * Default: `1`
     */
    public get risk(): number {
        return this.get("risk");
    }

    /**
     * The shot status of the content\
     * `approved` - Content can be posted in comments\
     * `shot` - Content can't be posted in comments\
     * `hardShot` - Content was removed by iFunny and is not viewable
     */
    public get shotStatus(): APIContentShotStatus {
        return this.get("shot_status");
    }

    /**
     * The size of the Content
     */
    public get size(): Size {
        return this.get("size");
    }

    /**
     * The source of the content if it exists
     */
    public get source(): APIContentSource | null {
        return this.get("source");
    }

    /**
     * The state of the Content
     */
    public get state(): APIContentState {
        return this.get("state");
    }

    /**
     * The numbers attached to the Content
     * Alias for {@link num}
     */
    public get stats(): APIContentNums {
        return this.num;
    }

    /**
     * All tags on the Content
     */
    public get tags(): string[] {
        return this.get("tags");
    }

    /**
     * Thumbnail of the Content
     */
    public get thumbnail(): APIContentThumbnail {
        return this.get("thumb");
    }

    /**
     * The Title of the content
     */
    public get title(): string {
        return this.get("title");
    }

    /**
     * URL of the original source if it exists
     */
    public get tracebackUrl(): string | null {
        return this.get("traceback_url");
    }

    /**
     * The type of the post
     */
    public get type(): APIContentType {
        return this.get("type");
    }

    /**
     * URL of the Content
     */
    public get url(): string {
        return this.get("url");
    }

    /**
     * The Content's visibility status\
     * `public` - Content shows up in collective and explore
     * `subscribers` - Content is hidden from Collective and Explore
     * `closed` - Content is not visible by anyone but the author
     */
    public get visibility(): APIContentVisibility {
        return this.get("visibility");
    }

    /**
     * When concatenated with a string, this automatically returns the content's id instead of the Content object.
     * @example
     * console.log(`Found post: ${content}`); //  Logs: Found post: 2hu2ab8J
     */
    public override toString(): string {
        return this.id;
    }
}

export default BaseContent;
