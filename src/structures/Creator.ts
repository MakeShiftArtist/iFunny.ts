import { APIContentCreator } from "@ifunny/ifunny-api-types";
import Client from "../client/Client";
import { Base } from "./Base";
import { User } from "./User";

export class Creator extends Base<APIContentCreator> {
	constructor(client: Client, payload: APIContentCreator) {
		super(client, payload);
	}

	private _user: User | null = null;

	/**
	 * The Content Creator's User Object
	 */
	async user() {
		return (this._user ??= await this.client.users.fetch(this.id));
	}

	/**
	 * The user ID of the Creator
	 */
	override get id() {
		return super.id;
	}

	/**
	 * Is the creator banned
	 */
	get isBanned() {
		return this.get("is_banned");
	}

	/**
	 * Is the creator blocked by the Client
	 */
	get isBlocked() {
		return this.get("is_blocked");
	}

	/**
	 * Is the creator a deleted user
	 */
	get isDeleted() {
		return this.get("is_deleted");
	}

	/**
	 * Is the creator subscribed to the Client
	 */
	get isSubscriber() {
		return this.get("is_in_subscribers");
	}

	/**
	 * Is the Client subscribed to the Creator
	 */
	get isSubscription() {
		return this.get("is_in_subscriptions");
	}

	/**
	 * Is the Creator verified
	 */
	get isVerified() {
		return this.get("is_verified");
	}

	/**
	 * The creators nick
	 * @alias username
	 */
	get nick() {
		return this.get("nick");
	}

	/**
	 * The creators username
	 * @alias nick
	 */
	get username() {
		return this.nick;
	}

	/**
	 * The creators nick color
	 */
	get nickColor() {
		return this.get("nick_color");
	}

	/**
	 * The creators nums
	 * @alias stats
	 */
	get num() {
		return this.get("num");
	}

	/**
	 * The creators stats
	 * @alias num
	 */
	get stats() {
		return this.num;
	}

	/**
	 * The craetor's original nick
	 */
	get originalNick() {
		return this.get("original_nick");
	}

	/**
	 * The creator's profile photo
	 */
	get photo() {
		return this.get("photo");
	}

	/**
	 * Total number of posts the creator has\
	 * ? This isn't in Creator.num for some reason
	 */
	get totalPosts() {
		return this.get("total_posts");
	}
}
