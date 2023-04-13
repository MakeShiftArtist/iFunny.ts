import { type APIUserProfile, Endpoints, IFUNNY_ERRORS } from "@ifunny/ifunny-api-types";
import { BaseUser } from "./BaseUser";
import { iFunnyError } from "../errors/iFunnyError";
import Feed from "./Feed";
import type { Client } from "../client/Client";

/**
 * Represents a user on iFunny
 * @extends BaseUser
 */
export class User extends BaseUser {
	#timeline: Feed | null = null;

	/**
	 * @param client Client instance associated with the User
	 * @param payload Payload of the User
	 */
	public constructor(client: Client, payload: APIUserProfile) {
		super(client, payload);
	}

	/**
	 * Modify the subscription status of the User
	 * @param method "PUT" or "DELETE"
	 */
	async #modifySubscription(method: "PUT" | "DELETE"): Promise<this> {
		if (!this.client.isAuthorized()) {
			throw new iFunnyError(this.client, {
				error: IFUNNY_ERRORS.UNAUTHORIZED,
				error_description: "Requested operation is unavailable for guests",
				status: 400,
			});
		}

		if (this.id === this.client.payload.id) {
			return this;
		}

		await this.client.instance.request({
			method,
			url: Endpoints.subscribers(this.id),
		});

		return this;
	}

	/**
	 * Subscribe to the User
	 */
	public async subscribe(): Promise<void> {
		await this.#modifySubscription("PUT");
	}

	/**
	 * Unsubscribe from the User
	 */
	public async unsubscribe(): Promise<void> {
		this.#modifySubscription("DELETE");
	}

	/**
	 * Get the User's timeline object
	 * @returns Feed
	 */
	public get timeline(): Feed {
		return (this.#timeline ??= new Feed(
			this.client,
			Endpoints.userTimeline(this.id)
		));
	}
}

export default User;
