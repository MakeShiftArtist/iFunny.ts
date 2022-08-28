import { Base } from "../structures/Base";
import { Client } from "../client/Client";
import { Collection } from "@discordjs/collection";

type DataStructure = new (client: Client, id: string, ...extra: any[]) => Base<any>;

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
	private readonly _cache: Collection<string, InstanceType<T>> = new Collection();

	/**
	 * The data structure belonging to this manager
	 */
	protected readonly _holds: T;

	constructor(client: Client, holds: T) {
		this.client = client;

		this._holds = holds;
	}

	public get cache() {
		return this._cache;
	}

	resolve(idOrInstance: string | InstanceType<T>) {
		if (idOrInstance instanceof this._holds) return idOrInstance;
		if (typeof idOrInstance === "string") {
			return this._cache.get(idOrInstance) ?? null;
		}
		return null;
	}

	resolveId(idOrInstance: string | InstanceType<T>) {
		if (idOrInstance instanceof this._holds) return idOrInstance.id;
		if (typeof idOrInstance === "string") return idOrInstance;
		return null;
	}
}
