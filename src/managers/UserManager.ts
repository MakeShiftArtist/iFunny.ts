import { CachedManager } from "./CachedManager";
import { Client } from "../client/Client";
import { User } from "../structures/User";

export class UserManager extends CachedManager<User> {
	constructor(client: Client) {
		super(client);
	}
}
