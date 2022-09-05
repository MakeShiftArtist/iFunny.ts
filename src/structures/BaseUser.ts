import { APIUser, APIUserNums, Endpoints } from "@ifunny/ifunny-api-types";

import { Base } from "./Base";
import type { Client } from "../client/Client";
import { Collection } from "@discordjs/collection";
import { MemeExperience } from "./MemeExperience";

/**
 * Base User class that user class will inherit from.
 * @extends Base
 */
export class BaseUser extends Base<APIUser> {
	/**
	 * @param client The client instance
	 * @param id The id of the user
	 * @param payload Payload to create the User with
	 */
	constructor(client: Client, id: string, payload: any = {}) {
		super(client, id, payload);
		this.payload = payload;
		this.endpoint_url = Endpoints.user(id);
	}

	/**
	 * Is the user a partial
	 */
	get partial() {
		return !!this.nick;
	}

	/**
	 * The user's about text
	 * @alias bio
	 */
	get about() {
		return this.get("about");
	}

	/**
	 * @alias about
	 */
	get bio() {
		return this.about;
	}

	/**
	 * Does the user have you blocked?
	 */
	get areYouBlocked() {
		return this.get("are_you_blocked");
	}

	/**
	 * Collection of Bans the user has
	 */
	get bans() {
		let bans = this.get("bans") ?? [];
		return new Collection(bans.map((ban) => [ban.id, ban]));
	}

	/**
	 * Cover image background color
	 */
	get coverColor() {
		return this.get("cover_bg_color");
	}

	/**
	 * Cover imamge url
	 */
	get coverUrl() {
		return this.get("cover_url");
	}

	/**
	 * The user's unique id
	 */
	override get id() {
		return super.id;
	}

	/**
	 * Can the Client chat with the user?\
	 * ? Not checked by the backend
	 */
	get isAvailableForChat() {
		return this.get("is_available_for_chat");
	}

	/**
	 * Is the user banned?
	 */
	get isBanned() {
		return this.get("is_banned");
	}

	/**
	 * Is the user blocked by the Client?
	 */
	get isBlocked() {
		return this.get("is_blocked");
	}

	/**
	 * Is the user deleted?
	 */
	get isDeleted() {
		return this.get("is_deleted");
	}

	/**
	 * Is the user subscribed to the Client?
	 */
	get isSubscriber() {
		return this.get("is_in_subscribers");
	}

	/**
	 * Is the client subscribed to the user?
	 */
	get isSubscription() {
		return this.get("is_in_subscriptions");
	}

	/**
	 * Is the user's account private?
	 */
	get isPrivate() {
		return this.get("is_private");
	}

	/**
	 * Is the user subscribed to updates?
	 */
	get isSubscribedToUpdates() {
		return this.get("is_subscribed_to_updates");
	}

	/**
	 * Is the user verified?
	 */
	get isVerified() {
		return this.get("is_verified");
	}

	/**
	 * The user's meme experience
	 */
	get memeExperience() {
		let memeExp = this.get("meme_experience");
		return memeExp ? new MemeExperience(memeExp) : null;
	}

	/**
	 * The user's chat privacy
	 */
	get chatPrivacy() {
		return this.get("messaging_privacy_status");
	}

	/**
	 * TODO: Add description for messengerActive
	 */
	get messengerActive() {
		return this.get("messenger_active");
	}

	/**
	 * TODO: Add description for messengerToken
	 */
	get messengerToken() {
		return this.get("messenger_token");
	}

	/**
	 * Nickname of the user
	 * @alias username
	 */
	get nick() {
		return this.get("nick");
	}

	/**
	 * Nickname of the user
	 * @alias nick
	 */
	get username() {
		return this.nick;
	}

	/**
	 * The nick color of the user if they have one, else null
	 */
	get nickColor() {
		return this.get("nick_color");
	}

	/**
	 * The users {@link APIUserNums `num` } object
	 * @alias `stats`
	 */
	get num() {
		return this.get("num");
	}

	/**
	 * The users {@link APIUserNums `num` } object
	 * @alias num
	 */
	get stats() {
		return this.num;
	}

	/**
	 * The users subscription count\
	 * ? `-1` = `unknown`
	 */
	get totalSubscriptions() {
		return this.num?.subscriptions ?? -1;
	}

	/**
	 * The users subsciber count\
	 * ? `-1` = `unknown`
	 */
	get totalSubscribers() {
		this.payload;
		return this.num?.subscribers ?? -1;
	}

	/**
	 * How many posts the user has on their profile\
	 * ? `-1` = `unknown`
	 */
	get totalPosts() {
		return this.num?.total_posts ?? -1;
	}

	/**
	 * How many original posts the user has\
	 * ? `-1` = `unknown`
	 */
	get totalOriginalPosts() {
		return this.num?.created ?? -1;
	}

	/**
	 * How many posts the has that are republishes (***NOT original***)\
	 * ? `-1` = `unknown`
	 */
	get totalRepublishedPosts() {
		return this.num ? this.totalPosts - this.totalOriginalPosts : -1;
	}

	/**
	 * How many features the user has\
	 * ? `-1` = `unknown`
	 */
	get totalFeatures() {
		return this.num?.featured ?? -1;
	}

	/**
	 * How many smiles the user has on their profile\
	 * ? `-1` = `unknown`
	 */
	get totalSmiles() {
		return this.num?.total_smiles ?? -1;
	}

	/**
	 * How many achievements the user has\
	 * ? `-1` = `unknown`
	 */
	get totalAchievements() {
		return this.num?.achievements ?? -1;
	}
}
