import { Base } from "../structures/Base";
import { Client } from "../client/Client";
import { Collection } from "@discordjs/collection";

/**
 * Manages API methods of a data model
 */
export class CachedManager<T extends Base<any>> {
	/**
	 * The client this manager is attached to
	 */
	public readonly client: Client;
	private _cache: Collection<string, T> = new Collection();
	constructor(client: Client) {
		this.client = client;
	}

	public get cache() {
		return this._cache;
	}
}
