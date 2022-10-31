import { Base } from "../structures/Base";
import { Client } from "../client/Client";
import { Collection } from "@discordjs/collection";

type DataStructure = new (client: Client, payload: any, ...extra: any[]) => Base<any>;

// TODO: Implement actual cache instead of using a collection

/**
 * Manages API methods of a data model
 */
export class CachedManager<T extends DataStructure> {
	/**
	 * The client this manager is attached to
	 */
	public readonly client: Client;

	/**
	 * The cache of items for this manager
	 */
	readonly #cache: Collection<string, InstanceType<T>> = new Collection();

	/**
	 * The data structure belonging to this manager
	 */
	readonly #holds: T;

	/**
	 * @param client Client attached to the CachedManager
	 * @param holds The class constructor the manager uses
	 */
	constructor(client: Client, holds: T) {
		this.client = client;

		this.#holds = holds;
	}

	/**
	 * The cache of users
	 */
	public get cache() {
		return this.#cache;
	}

	/**
	 * The class this manager holds
	 */
	public get holds() {
		return this.#holds;
	}

	/**
	 * Resolves an id or instance into an instance
	 * @param idOrInstance Id of the instance or the instance itself
	 */
	resolve(idOrInstance: string | InstanceType<T>): InstanceType<T> | null {
		if (idOrInstance instanceof this.#holds) return idOrInstance;
		if (typeof idOrInstance === "string") {
			return this.#cache.get(idOrInstance) ?? null;
		}
		return null;
	}

	/**
	 * Resolves an id or instance into an id
	 * @param idOrInstance Id of the instance of the instance itself
	 */
	resolveId(idOrInstance: string | InstanceType<T>): string | null {
		if (idOrInstance instanceof this.#holds) return idOrInstance.id;
		if (typeof idOrInstance === "string") return idOrInstance;
		return null;
	}
}
