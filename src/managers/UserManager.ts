import {
	APIUser,
	Endpoints,
	RESTAPISuccessResponse as Success,
} from "@ifunny/ifunny-api-types";

import { CachedManager } from "./CachedManager";
import { Client } from "../client/Client";
import { User } from "../structures/User";

export class UserManager extends CachedManager<typeof User> {
	constructor(client: Client) {
		super(client, User);
	}

	/**
	 * @param idOrNick Id or nick of the user
	 * @param byNick Whether to lookup by nick
	 * @param cached Whater to return the cached result
	 * @returns
	 */
	public async fetch(
		idOrNick: string,
		byNick: boolean = false,
		cached: boolean = true
	) {
		let user: User | null;
		if (cached) user = this.resolve(idOrNick);
		let { data } = await this.client.instance.request<Success<APIUser> | null>({
			url: Endpoints.user(idOrNick, byNick),
		});
		if (!data) return data;
		user = new User(this.client, data.data.id, data.data);
		this.cache.set(user.id, user);
		this.cache.set(user.nick!, user);
		return user;
	}
}
