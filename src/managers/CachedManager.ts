import { Client } from "../client/Client";
import { Cache } from "../structures/Cache";
import { DataStructure } from "../structures/Cache";
import { ICachingOptions } from "node-ts-cache";

/**
 * Manages API methods of a data model
 * @template Holds
 */
export class CachedManager<Holds extends DataStructure> {
	/**
	 * The client this manager is attached to
	 */
	public readonly client: Client;

	/**
	 * The cache of items for this manager
	 */
	readonly #cache: Cache<Holds>;

	/**
	 * The data structure belonging to this manager
	 */
	readonly #holds: Holds;

	/**
	 * @param client Client attached to the CachedManager
	 * @param holds The class constructor the manager uses
	 * @param cache_config Config for the cache to use
	 */
	public constructor(client: Client, holds: Holds, cache_config: ICachingOptions) {
		this.client = client;
		this.#cache = new Cache(holds, cache_config);
		this.#holds = holds;
	}

	/**
	 * The cache of users
	 */
	public get cache(): Cache<Holds> {
		return this.#cache;
	}

	/**
	 * The class this manager holds
	 */
	public get holds(): Holds {
		return this.#holds;
	}

	/**
	 * Resolves an id or instance into an instance
	 * @param id_or_instance Id of the instance or the instance itself
	 */
	public async resolve(
		id_or_instance: string | InstanceType<Holds>
	): Promise<InstanceType<Holds> | null> {
		if (id_or_instance instanceof this.#holds) return id_or_instance;
		if (typeof id_or_instance === "string") {
			return (await this.#cache.get(id_or_instance)) ?? null;
		}
		return null;
	}

	/**
	 * Resolves an id or instance into an id
	 * @param id_or_instance Id of the instance of the instance itself
	 */
	public resolve_id(id_or_instance: string | InstanceType<Holds>): string | null {
		if (id_or_instance instanceof this.#holds) return id_or_instance.id;
		if (typeof id_or_instance === "string") return id_or_instance;
		return null;
	}
}

export default CachedManager;
