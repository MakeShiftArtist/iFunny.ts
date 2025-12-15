import {
    Endpoints,
    type APICommentAuthor,
    type APIProfilePhoto,
    type APISimpleUser,
    type APIUserNums,
} from "@ifunny/ifunny-api-types";
import { Base } from "./Base";
import type { Client } from "../client/Client";
import type { User } from "./User";

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
    public constructor(
        client: Client,
        payload: APISimpleUser | APICommentAuthor,
    ) {
        super(client, payload);
        this.endpointUrl = Endpoints.user(this.id);
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
     * Is the user subcribed to the Client?
     */
    public get isSubscriber(): boolean {
        return this.get("is_in_subscribers");
    }

    /**
     * Is the Cilent subscribed to the user?
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
     * User's nick
     * Alias for {@link username}
     */
    public get nick(): string {
        return this.get("nick");
    }

    /**
     * Nums for the user
     * Alias for {@link stats}
     */
    public get num(): APIUserNums {
        return this.get("num");
    }

    /**
     * Original nick for the user
     */
    public get originalNick(): string {
        return this.get("original_nick");
    }

    /**
     * Profile photo for the user
     */
    public get photo(): APIProfilePhoto | null {
        return this.get("photo");
    }

    /**
     * Stats for the user
     * Alias for {@link num}
     */
    public get stats(): APIUserNums {
        return this.num;
    }

    /**
     * Amount of posts the user has
     */
    public get totalPosts(): number {
        return this.get("total_posts");
    }

    /**
     * Amount of subscribers the user has
     */
    public get totalSubscribers(): number {
        return this.num.subscribers;
    }

    /**
     * Amount of subcriptions the user has
     */
    public get totalSubscriptions(): number {
        return this.num.subscriptions;
    }

    /**
     * User's nick
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

export default SimpleUser;
