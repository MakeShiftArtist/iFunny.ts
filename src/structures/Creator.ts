import { Base } from "./Base";
import type { Client } from "../client/Client";
import type { User } from "./User";
import type {
    APIContentCreator,
    APINickColor,
    APIProfilePhoto,
    APIUserNums,
    APIUserRating,
} from "@ifunny/ifunny-api-types";

/**
 * Preresents a Content Creator on iFunny
 * @extends Base<APIContentCreator>
 */
export class Creator extends Base<APIContentCreator> {
    /**
     * The Content Creator's User Object
     */
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
     * @returns Promise that resolves to the User Object
     */
    public async user(): Promise<User> {
        return (this.#user ??= await this.client.users.fetch(this.id))!;
    }

    /**
     * Is the creator banned?
     * @returns boolean
     */
    public get isBanned(): boolean {
        return this.get("is_banned");
    }

    /**
     * Is the creator blocked by the Client?
     * @returns boolean
     */
    public get isBlocked(): boolean {
        return this.get("is_blocked");
    }

    /**
     * Is the creator a deleted user?
     * @returns boolean
     */
    public get isDeleted(): boolean {
        return this.get("is_deleted");
    }

    /**
     * Is the creator subscribed to the Client?
     * @returns boolean
     */
    public get isSubscriber(): boolean {
        return this.get("is_in_subscribers");
    }

    /**
     * Is the Client subscribed to the Creator?
     * @returns boolean
     */
    public get isSubscription(): boolean {
        return this.get("is_in_subscriptions");
    }

    /**
     * Is the Creator verified?
     * @returns boolean
     */
    public get isVerified(): boolean {
        return this.get("is_verified");
    }

    /**
     * The creator's nick
     * Alias for {@link username}
     */
    public get nick(): string {
        return this.get("nick");
    }

    /**
     * The creator's nick color
     * @returns A hex color code without the # prefix
     * @example
     * nick_color: "55FF00"
     */
    public get nickColor(): APINickColor | null {
        return this.get("nick_color");
    }

    /**
     * The creator's nums
     * Alias for {@link stats}
     */
    public get num(): APIUserNums {
        return this.get("num");
    }

    /**
     * The creator's original nick\
     * ? iFunny sometimes censors users nicknames
     * @example
     * nick: "garespectingyoass"
     * original_nick: "garapingyoass"
     */
    public get originalNick(): string {
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
     * Alias for {@link num}
     */
    public get stats(): APIUserNums {
        return this.num;
    }

    /**
     * Total number of posts the creator has\
     * ? This isn't in Creator.num for some reason
     */
    public get totalPosts(): number {
        return this.get("total_posts");
    }

    /**
     * The creator's username
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

export default Creator;
