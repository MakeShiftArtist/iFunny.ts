import { APINews } from "@ifunny/ifunny-api-types";
import { Nullify } from "../utils/Types";

// TODO: Document News properties

/**
 * Represents a News object from the Activity Feed
 */
export class News {
	readonly #payload: APINews;
	/**
	 * @param news Payload of the News Object
	 */
	public constructor(news: APINews) {
		this.#payload = news;
	}

	public get payload() {
		return this.#payload;
	}

	protected get<K extends keyof APINews>(key: K): Nullify<APINews[K]> {
		return (this.payload[key] ?? null) as Nullify<APINews[K]>;
	}

	public get date() {
		return new Date(this.get("date") * 1000);
	}

	public get type() {
		return this.get("type");
	}

	public get ban_id() {
		return this.get("banId");
	}

	public get ban_message() {
		return this.get("banTypeMessage");
	}

	public get ban_type() {
		return this.get("banType");
	}

	public get comment() {
		return this.get("comment");
	}

	public get content() {
		return this.get("content");
	}

	public get count_active_strike() {
		return this.get("countActiveStrike");
	}

	public get date_until() {
		return this.get("date_until");
	}

	public get expired_at() {
		return this.get("expiredAt");
	}

	public get image_url() {
		return this.get("imageUrl");
	}

	public get mention_content() {
		return this.get("mention_content");
	}

	public get mention_users() {
		return this.get("mention_users");
	}

	public get purchase_type() {
		return this.get("purchaseType");
	}

	public get reply() {
		return this.get("reply");
	}

	public get smiles() {
		return this.get("smiles");
	}

	public get strike_id() {
		return this.get("strikeId");
	}

	public get text() {
		return this.get("text");
	}

	public get title() {
		return this.get("title");
	}

	public get url() {
		return this.get("url");
	}

	public get user() {
		return this.get("user");
	}

	public get username() {
		return this.get("username");
	}
}

export default News;
