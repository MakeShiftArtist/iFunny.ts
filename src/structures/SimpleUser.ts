import {
	APIProfilePhoto,
	APISimpleUser,
	APIUserNums,
	Endpoints,
} from "@ifunny/ifunny-api-types";
import { Client } from "../client/Client";
import { Base } from "./Base";
import { User } from "./User";

/**
 * Simple user class, typically found in pagination
 * @extends Base<APISimpleUser>
 */
export class SimpleUser extends Base<APISimpleUser> {
	/**
	 * Cached user to prevent multiple API calls
	 */
	#user: User | null = null;

	/**
	 * @param client Client attached to the SimpleUser
	 * @param payload Payload for the SimpleUser
	 */
	constructor(client: Client, payload: APISimpleUser) {
		super(client, payload);
		this.endpoint_url = Endpoints.user(this.id);
	}

	/**
	 * Fetches the User object
	 * @returns The User object with more information
	 */
	public async user(): Promise<User | null> {
		return (this.#user ??= await this.client.users.fetch(this.id));
	}

	/**
	 * Is the user banned?
	 */
	public get is_banned(): boolean {
		return this.get("is_banned");
	}

	/**
	 * Is the user blocked by the Client
	 */
	public get is_blocked(): boolean {
		return this.get("is_blocked");
	}

	/**
	 * Is the user deleted
	 */
	public get is_deleted(): boolean {
		return this.get("is_deleted");
	}

	/**
	 * Is the user subcribed to the Client
	 */
	public get is_subscriber(): boolean {
		return this.get("is_in_subscribers");
	}

	/**
	 * Is the Cilent subscribed to the user
	 */
	public get is_subscription(): boolean {
		return this.get("is_in_subscriptions");
	}

	/**
	 * Is the user verified
	 */
	public get is_verified(): boolean {
		return this.get("is_verified");
	}

	/**
	 * User's nick
	 * @alias username
	 */
	public get nick(): string {
		return this.get("nick");
	}

	/**
	 * Nums for the user
	 * @alias stats
	 */
	public get num(): APIUserNums {
		return this.get("num");
	}

	/**
	 * Stats for the user
	 * @alias num
	 */
	public get stats(): APIUserNums {
		return this.num;
	}

	/**
	 * Amount of subscribers the user has
	 */
	public get total_subscribers(): number {
		return this.num.subscribers;
	}

	/**
	 * Amount of subcriptions the user has
	 */
	public get total_subscriptions(): number {
		return this.num.subscriptions;
	}

	/**
	 * Amount of posts the user has
	 */
	public get total_posts(): number {
		return this.get("total_posts");
	}

	/**
	 * User's nick
	 * @alias nick
	 */
	public get username(): string {
		return this.nick;
	}

	/**
	 * Original nick for the user
	 */
	public get original_nick(): string {
		return this.get("original_nick");
	}

	/**
	 * Profile photo for the user
	 */
	public get photo(): APIProfilePhoto | null {
		return this.get("photo");
	}
}

export default SimpleUser;
