import type {
	APIBanType,
	APIComment,
	APIContent,
	APIMentionUser,
	APINews,
	APINewsType,
	APINewsUser,
} from "@ifunny/ifunny-api-types";
import type { Nullify } from "../utils/Types";
import Content from "./Content";
import Client from "../client/Client";

/**
 * Represents a News object from the Activity Feed
 */
export class News {
	readonly #payload: APINews;
	readonly #client: Client;
	/**
	 * @param client The Client associated with the News
	 * @param news Payload of the News Object
	 */
	public constructor(client: Client, news: APINews) {
		this.#payload = news;
		this.#client = client;
	}

	/**
	 * The Client associated with the News
	 */
	public get client(): Client {
		return this.#client;
	}

	/**
	 * Payload of the News
	 */
	public get payload() {
		return this.#payload;
	}

	/**
	 * Get the value of a property of the News object from the payload
	 * @param key Key of the property
	 * @returns The value of the property
	 */
	protected get<K extends keyof APINews>(key: K): Nullify<APINews[K]> {
		return (this.payload[key] ?? null) as Nullify<APINews[K]>;
	}

	/**
	 * The Date of the News object
	 */
	public get date(): Date {
		return new Date(this.get("date") * 1000);
	}

	/**
	 * The type of the News object
	 */
	public get type(): APINewsType {
		return this.get("type");
	}

	/**
	 * The ID of the Ban associated with the News object
	 */
	public get banId(): string | null {
		return this.get("banId");
	}

	/**
	 * The message associated with the Ban associated with the News object
	 */
	public get banMessage(): string | null {
		return this.get("banTypeMessage");
	}

	/**
	 * The type of the Ban associated with the News object
	 */
	public get banType(): APIBanType | null {
		return this.get("banType");
	}

	/**
	 * The raw comment associated with the News object
	 */
	public get comment(): APIComment | null {
		return this.get("comment");
	}

	/**
	 * The content associated with the News object
	 */
	public get content(): APIContent | null {
		return this.get("content");
	}

	/**
	 * The current number of active strikes for the Client
	 */
	public get countActiveStrike(): number | null {
		return this.get("countActiveStrike");
	}

	/**
	 * The date that the Ban or Strike will expire
	 */
	public get dateUntil(): Date | null {
		const date = this.get("date_until");
		return date ? new Date(date * 1000) : null;
	}

	/**
	 * The date that the Ban or Strike expired
	 */
	public get expiredAt(): Date | null {
		const date = this.get("expiredAt");
		return date ? new Date(date * 1000) : null;
	}

	/**
	 * The URL of the image associated with the News object
	 */
	public get imageUrl(): string | null {
		return this.get("imageUrl");
	}

	/**
	 * The Content mentioned in this news object
	 */
	public get mentionContent() {
		const content = this.get("mention_content");
		return content ? new Content(this.client, content) : null;
	}

	/**
	 * The users mentioned in this news object
	 */
	public get mentionUsers(): APIMentionUser[] | null {
		return this.get("mention_users");
	}

	/**
	 * The type of purchase associated with the News object
	 */
	public get purchaseType(): string | null {
		return this.get("purchaseType");
	}

	/**
	 * The raw reply associated with the News object
	 */
	public get reply(): APIComment | null {
		return this.get("reply");
	}

	/**
	 * The number of smiles associated with the News object
	 */
	public get smiles(): number | null {
		return this.get("smiles");
	}

	/**
	 * The ID of the strike associated with the News object
	 */
	public get strikeId(): string | null {
		return this.get("strikeId");
	}

	/**
	 * The message associated with the strike associated with the News object
	 */
	public get text(): string | null {
		return this.get("text");
	}

	/**
	 * The title of the News object
	 */
	public get title(): string | null {
		return this.get("title");
	}

	/**
	 * The URL of the News object
	 */
	public get url(): string | null {
		return this.get("url");
	}

	/**
	 * The User associated with the News object
	 */
	public get user(): APINewsUser | null {
		return this.get("user");
	}

	/**
	 * The username associated with the News object
	 */
	public get username(): string | null {
		return this.get("username");
	}
}

export default News;
