import { Base } from "./Base";
import { CacheContainer, ICachingOptions } from "node-ts-cache";
import { Client } from "../client/Client";
import { MemoryStorage } from "node-ts-cache-storage-memory";

export type DataStructure = new (
	client: Client,
	payload: any,
	...extra: any[]
) => Base<any>;

/**
 * Cache object for data caching
 * @template Holds
 * @extends CacheContainer
 */
export class Cache<Holds extends DataStructure> extends CacheContainer {
	readonly #holds: Holds;
	#config: ICachingOptions;
	constructor(holds: Holds, config: ICachingOptions) {
		super(new MemoryStorage());
		this.#holds = holds;
		this.#config = config;
	}

	/**
	 * Cache Config this is using
	 */
	get config() {
		return this.#config;
	}

	/**
	 * Class constructor that this Cache holds
	 */
	public get holds() {
		return this.#holds;
	}

	/**
	 * Fetches an item from the cache if it exists, else null
	 * @param key Key for the item
	 * @returns The item or null if it wasn't found
	 */
	public async get(key: string): Promise<InstanceType<Holds> | null> {
		return (await this.getItem<InstanceType<Holds>>(key)) ?? null;
	}

	/**
	 * Sets an item in the cache
	 * @param key Key for the item
	 * @param value The item to cache
	 * @param options The caching options to use
	 * @returns this for method chaining
	 */
	public async set(
		key: string,
		value: InstanceType<Holds>,
		options?: Partial<ICachingOptions>
	): Promise<this> {
		await this.setItem(key, value, options ?? this.config);
		return this;
	}
}

export default Cache;
