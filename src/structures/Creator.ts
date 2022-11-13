import {
	APIContentCreator,
	APINickColor,
	APIProfilePhoto,
	APIUserNums,
	APIUserRating,
} from "@ifunny/ifunny-api-types";
import { Base } from "./Base";
import { Client } from "../client/Client";
import { User } from "./User";

/**
 * Preresents a Content Creator on iFunny
 * @extends Base<APIContentCreator>
 */
export class Creator extends Base<APIContentCreator> {
	#user: User | null = null;

	/**
	 * @param client Client instance for the Creator
	 * @param payload Payload of the content creator
	 */
	public constructor(client: Client, payload: APIContentCreator) {
		super(client, payload);
	}

	/**
	 * The Content Creator's User Object
	 */
	public async user(): Promise<User> {
		return (this.#user ??= await this.client.users.fetch(this.id))!;
	}

	/**
	 * Is the creator banned
	 */
	public get is_banned(): boolean {
		return this.get("is_banned");
	}

	/**
	 * Is the creator blocked by the Client
	 */
	public get is_blocked(): boolean {
		return this.get("is_blocked");
	}

	/**
	 * Is the creator a deleted user
	 */
	public get is_deleted(): boolean {
		return this.get("is_deleted");
	}

	/**
	 * Is the creator subscribed to the Client
	 */
	public get is_subscriber(): boolean {
		return this.get("is_in_subscribers");
	}

	/**
	 * Is the Client subscribed to the Creator
	 */
	public get is_subscription(): boolean {
		return this.get("is_in_subscriptions");
	}

	/**
	 * Is the Creator verified
	 */
	public get is_verified(): boolean {
		return this.get("is_verified");
	}

	/**
	 * The creator's nick
	 * @alias username
	 */
	public get nick(): string {
		return this.get("nick");
	}

	/**
	 * The creator's nick color
	 */
	public get nick_color(): APINickColor | null {
		return this.get("nick_color");
	}

	/**
	 * The creator's nums
	 * @alias stats
	 */
	public get num(): APIUserNums {
		return this.get("num");
	}

	/**
	 * The creator's original nick
	 */
	public get original_nick(): string {
		return this.get("original_nick");
	}

	/**
	 * The creator's profile photo
	 */
	public get photo(): APIProfilePhoto | null {
		return this.get("photo");
	}

	/**
	 * The creator's rating
	 */
	public get rating(): APIUserRating {
		return this.get("rating");
	}

	/**
	 * The creator's stats
	 * @alias num
	 */
	public get stats(): APIUserNums {
		return this.num;
	}

	/**
	 * Total number of posts the creator has\
	 * ? This isn't in Creator.num for some reason
	 */
	public get total_posts(): number {
		return this.get("total_posts");
	}

	/**
	 * The creator's username
	 * @alias nick
	 */
	public get username(): string {
		return this.nick;
	}
}

export default Creator;
