import {
    Endpoints,
    type APINickColor,
    type APIProfilePhoto,
    type APIUserAllSocials,
    type APIUserBlockType,
    type APIUserMessagePrivacy,
    type APIUserProfile,
    type APIUserProfileNums,
} from "@ifunny/ifunny-api-types";
import { BanSmall } from "./BanSmall";
import { Base } from "./Base";
import { MemeExperience } from "./MemeExperience";
import type { Client } from "../client/Client";

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
        this.endpointUrl = Endpoints.user(payload.id);
    }

    /**
     * The user's about text
     * Alias for {@link bio}
     */
    public get about(): string {
        return this.get("about");
    }

    /**
     * Does the user have you blocked?
     */
    public get areYouBlocked(): boolean {
        return this.get("are_you_blocked");
    }

    /**
     * Collection of Bans the user has
     */
    public get bans(): BanSmall[] {
        const bans = this.get("bans") ?? [];
        return bans.map((ban) => new BanSmall(this, ban));
    }

    /**
     * The user's about text
     * Alias for {@link about}
     */
    public get bio(): string {
        return this.about;
    }

    /**
     * The block type if the user is blocked
     */
    public get blockType(): APIUserBlockType | null {
        return this.get("block_type");
    }

    /**
     * Can the Client chat with the user?\
     * ? Not checked by the backend
     * Alias for {@link isAvailableForChat}
     */
    public get canChat(): boolean {
        return this.isAvailableForChat;
    }

    /**
     * The user's chat privacy
     */
    public get chatPrivacy(): APIUserMessagePrivacy {
        return this.get("messaging_privacy_status");
    }

    /**
     * Cover image background color
     */
    public get coverColor(): string | null {
        return this.get("cover_bg_color");
    }

    /**
     * Cover imamge url
     */
    public get coverUrl(): string | null {
        return this.get("cover_url");
    }

    /**
     * Can the Client chat with the user?\
     * ? Not checked by the backend
     * Alias for {@link canChat}
     */
    public get isAvailableForChat(): boolean {
        return this.get("is_available_for_chat");
    }

    /**
     * Is the user banned?
     */
    public get isBanned(): boolean {
        return this.get("is_banned");
    }

    /**
     * Is the user blocked by the Client?
     */
    public get isBlocked(): boolean {
        return this.get("is_blocked");
    }

    /**
     * Is the user deleted?
     */
    public get isDeleted(): boolean {
        return this.get("is_deleted");
    }

    /**
     * Is the user's account private?
     */
    public get isPrivate(): boolean {
        return this.get("is_private");
    }

    /**
     * Is the user subscribed to updates?
     */
    public get isSubscribedToUpdates(): boolean {
        return this.get("is_subscribed_to_updates");
    }

    /**
     * Is the user subscribed to the Client?
     */
    public get isSubscriber(): boolean {
        return this.get("is_in_subscribers");
    }

    /**
     * Is the client subscribed to the user?
     */
    public get isSubscription(): boolean {
        return this.get("is_in_subscriptions");
    }

    /**
     * Is the user verified?
     */
    public get isVerified(): boolean {
        return this.get("is_verified");
    }

    /**
     * The user's unique uri
     * Alias for {@link webUrl}
     */
    public get link(): string {
        return this.webUrl;
    }

    /**
     * The user's unique uri
     * Alias for {@link link}
     */
    public get webUrl(): string {
        return this.get("web_url");
    }

    /**
     * The user's meme experience
     */
    public get memeExperience(): MemeExperience {
        return new MemeExperience(this.get("meme_experience"));
    }

    /**
     * TODO: Add description for messengerActive
     */
    public get messengerActive(): boolean {
        return this.get("messenger_active");
    }

    /**
     * TODO: Add description for messenger_token
     */
    public get messengerToken(): string {
        return this.get("messenger_token");
    }

    /**
     * Nickname of the user
     * Alias for {@link username}
     */
    public get nick(): string {
        return this.get("nick");
    }

    /**
     * The nick color of the user if they have one, else null
     */
    public get nickColor(): APINickColor | null {
        return this.get("nick_color");
    }

    /**
     * The users `num` object
     * Alias for {@link stats}
     */
    public get num(): APIUserProfileNums {
        return this.get("num");
    }

    /**
     * Profile photo of the user
     */
    public get profilePhoto(): APIProfilePhoto | null {
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
     * Alias for {@link num}
     */
    public get stats(): APIUserProfileNums {
        return this.num;
    }

    /**
     * The users subscription count
     */
    public get totalSubscriptions(): number {
        return this.num.subscriptions;
    }

    /**
     * The users subsciber count
     */
    public get totalSubscribers(): number {
        this.payload;
        return this.num.subscribers;
    }

    /**
     * How many posts the user has on their profile
     */
    public get totalPosts(): number {
        return this.num.total_posts;
    }

    /**
     * How many original posts the user has
     */
    public get totalOriginalPosts(): number {
        return this.num.created;
    }

    /**
     * How many posts the has that are republishes (***NOT original***)
     */
    public get totalRepublishedPosts(): number {
        return this.totalPosts - this.totalOriginalPosts;
    }

    /**
     * How many features the user has
     */
    public get totalFeatures(): number {
        return this.num.featured;
    }

    /**
     * How many smiles the user has on their profile
     */
    public get totalSmiles(): number {
        return this.num.total_smiles;
    }

    /**
     * How many achievements the user has
     */
    public get totalAchievements(): number {
        return this.num.achievements;
    }

    /**
     * Nickname of the user
     * Alias for {@link nick}
     */
    public get username(): string {
        return this.nick;
    }

    /**
     * When concatenated with a string, this automatically returns the user's nick instead of the User object.
     * @example
     * console.log(`Hello from ${user}!`); //  Logs: Hello from iFunnyChef
     */
    public override toString(): string {
        return this.nick;
    }
}

export default BaseUser;
