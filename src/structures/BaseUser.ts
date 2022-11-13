import {
	APINickColor,
	APIProfilePhoto,
	APIUserAllSocials,
	APIUserBlockType,
	APIUserMessagePrivacy,
	APIUserProfile,
	APIUserProfileNums,
	Endpoints,
} from "@ifunny/ifunny-api-types";
import { BanSmall } from "./BanSmall";
import { Base } from "./Base";
import { Client } from "../client/Client";
import { MemeExperience } from "./MemeExperience";

/**
 * Base User class that user class will inherit from.
 * @extends Base<APIUserProfile>
 */
export class BaseUser extends Base<APIUserProfile> {
	/**
	 * @param client The client instance
	 * @param payload Payload to create the User with
	 */
	public constructor(client: Client, payload: APIUserProfile) {
		super(client, payload);
		this.payload = payload;
		this.endpoint_url = Endpoints.user(payload.id);
	}

	/**
	 * The user's about text
	 * @alias bio
	 */
	public get about(): string {
		return this.get("about");
	}

	/**
	 * Does the user have you blocked?
	 */
	public get are_you_blocked(): boolean {
		return this.get("are_you_blocked");
	}

	/**
	 * Collection of Bans the user has
	 */
	public get bans(): BanSmall[] {
		const bans = this.get("bans") ?? [];
		return bans.map((ban) => new BanSmall(this.client, this, ban));
	}

	/**
	 * The user's about text
	 * @alias about
	 */
	public get bio(): string {
		return this.about;
	}

	/**
	 * The block type if the user is blocked
	 */
	public get block_type(): APIUserBlockType | null {
		return this.get("block_type");
	}

	/**
	 * Can the Client chat with the user?\
	 * ? Not checked by the backend
	 * @alias is_available_for_chat
	 */
	public get can_chat(): boolean {
		return this.is_available_for_chat;
	}

	/**
	 * The user's chat privacy
	 */
	public get chat_privacy(): APIUserMessagePrivacy {
		return this.get("messaging_privacy_status");
	}

	/**
	 * Cover image background color
	 */
	public get cover_color(): string | null {
		return this.get("cover_bg_color");
	}

	/**
	 * Cover imamge url
	 */
	public get cover_url(): string | null {
		return this.get("cover_url");
	}

	/**
	 * Can the Client chat with the user?\
	 * ? Not checked by the backend
	 * @alias can_chat
	 */
	public get is_available_for_chat(): boolean {
		return this.get("is_available_for_chat");
	}

	/**
	 * Is the user banned?
	 */
	public get is_banned(): boolean {
		return this.get("is_banned");
	}

	/**
	 * Is the user blocked by the Client?
	 */
	public get is_blocked(): boolean {
		return this.get("is_blocked");
	}

	/**
	 * Is the user deleted?
	 */
	public get is_deleted(): boolean {
		return this.get("is_deleted");
	}

	/**
	 * Is the user's account private?
	 */
	public get is_private(): boolean {
		return this.get("is_private");
	}

	/**
	 * Is the user subscribed to updates?
	 */
	public get is_subscribed_to_updates(): boolean {
		return this.get("is_subscribed_to_updates");
	}

	/**
	 * Is the user subscribed to the Client?
	 */
	public get is_subscriber(): boolean {
		return this.get("is_in_subscribers");
	}

	/**
	 * Is the client subscribed to the user?
	 */
	public get is_subscription(): boolean {
		return this.get("is_in_subscriptions");
	}

	/**
	 * Is the user verified?
	 */
	public get is_verified(): boolean {
		return this.get("is_verified");
	}

	/**
	 * The user's unique uri
	 * @alias web_url
	 */
	public get link(): string {
		return this.get("web_url");
	}

	/**
	 * The user's meme experience
	 */
	public get meme_experience(): MemeExperience {
		return new MemeExperience(this.get("meme_experience"));
	}

	/**
	 * TODO: Add description for messengerActive
	 */
	public get messenger_active(): boolean {
		return this.get("messenger_active");
	}

	/**
	 * TODO: Add description for messenger_token
	 */
	public get messenger_token(): string {
		return this.get("messenger_token");
	}

	/**
	 * Nickname of the user
	 * @alias username
	 */
	public get nick(): string {
		return this.get("nick");
	}

	/**
	 * The nick color of the user if they have one, else null
	 */
	public get nick_color(): APINickColor | null {
		return this.get("nick_color");
	}

	/**
	 * The users `num` object
	 * @alias `stats`
	 */
	public get num(): APIUserProfileNums {
		return this.get("num");
	}

	/**
	 * Profile photo of the user
	 */
	public get profile_photo(): APIProfilePhoto | null {
		return this.get("photo");
	}

	/**
	 * All the user's linked social media accounts
	 */
	public get socials(): APIUserAllSocials | null {
		return this.get("social");
	}

	/**
	 * The users  `num` object
	 * @alias num
	 */
	public get stats(): APIUserProfileNums {
		return this.num;
	}

	/**
	 * The users subscription count
	 */
	public get total_subscriptions(): number {
		return this.num.subscriptions;
	}

	/**
	 * The users subsciber count
	 */
	public get total_subscribers(): number {
		this.payload;
		return this.num.subscribers;
	}

	/**
	 * How many posts the user has on their profile
	 */
	public get total_posts(): number {
		return this.num.total_posts;
	}

	/**
	 * How many original posts the user has
	 */
	public get total_original_posts(): number {
		return this.num.created;
	}

	/**
	 * How many posts the has that are republishes (***NOT original***)
	 */
	public get total_republished_posts(): number {
		return this.total_posts - this.total_original_posts;
	}

	/**
	 * How many features the user has
	 */
	public get total_features(): number {
		return this.num.featured;
	}

	/**
	 * How many smiles the user has on their profile
	 */
	public get total_smiles(): number {
		return this.num.total_smiles;
	}

	/**
	 * How many achievements the user has
	 */
	public get total_achievements(): number {
		return this.num.achievements;
	}

	/**
	 * Nickname of the user
	 * @alias nick
	 */
	public get username(): string {
		return this.nick;
	}
}

export default BaseUser;
