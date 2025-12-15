import {
    APIUserProfile,
    Endpoints,
    IFUNNY_ERRORS,
    RESTAPISuccessResponse as Success,
} from "@ifunny/ifunny-api-types";
import { CachedManager } from "./CachedManager";
import { Client } from "../client/Client";
import { ICachingOptions } from "node-ts-cache";
import { iFunnyError } from "../errors/iFunnyError";
import { User } from "../structures/User";

/**
 * Manages iFunny Users
 * @extends CachedManager<User>
 */
export class UserManager extends CachedManager<typeof User> {
    /**
     * @param client Client instance attached to the UserManager
     */
    public constructor(client: Client, cacheConfig: ICachingOptions) {
        super(client, User, cacheConfig);
    }

    /**
     * Checks if a nick is available or if it's taken by another user\
     * It's a good idea to check this before signing up or changing your nick
     * @param nick Nick to check availability of
     */
    public async isNickAvailable(nick: string): Promise<boolean> {
        const { data } = await this.client.instance.get(
            Endpoints.nicksAvailable,
            {
                params: {
                    nick,
                },
            },
        );

        return data.data.available;
    }

    /**
     * Checks if an email is available or if it's taken by another user\
     * It's a good idea to check this before signing up or changing your email
     * @param email Email to check availability of
     */
    public async isEmailAvailable(email: string): Promise<boolean> {
        const { data } = await this.client.instance.get(
            Endpoints.emailsAvailable,
            {
                params: { email },
            },
        );

        return data.data.available;
    }

    /**
     * Fetches a user by their ID or Nick
     * @param idOrNick Id or nick of the user
     * @param byNick Whether to lookup by nick (Default: false)
     * @param cached Whater to return the cached result (Default: true)
     * @returns User|null if the client is authorized
     * @throws iFunnyError
     */
    public async fetch(
        idOrNick: string,
        byNick: boolean = false,
        cached: boolean = true,
    ): Promise<User | null> {
        try {
            let user = await this.resolve(idOrNick);
            if (cached && user) return user;

            const { data } =
                await this.client.instance.request<Success<APIUserProfile> | null>(
                    {
                        url: Endpoints.user(idOrNick, byNick),
                    },
                );

            if (!data) return data;

            user = new User(this.client, data.data);
            this.cache.set(user.id, user);
            this.cache.set(user.nick, user);
            return user;
        } catch (error) {
            if (error instanceof iFunnyError) {
                if (error.code === IFUNNY_ERRORS.NOT_FOUND) return null;
            }
            throw error;
        }
    }
}

export default UserManager;
