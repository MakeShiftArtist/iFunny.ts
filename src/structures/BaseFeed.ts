import { Client } from "../client/Client";

/**
 * All feed times
 */
export enum FeedType {
	FEATURES = "feeds/featured",
	COLLECTIVE = "feeds/collective",
	HOME = "timelines/home",
	TIMELINE = "timelines/users",
}

/**
 * Config for pagination
 */
export interface PaginateConfig {
	limit?: number;
	is_new?: boolean;
	next?: string;
	prev?: string;
}

/**
 * Base Feed class
 */
export class BaseFeed {
	/**
	 * The Client instance
	 */
	readonly #client: Client;
	/**
	 * Url for the feed
	 */
	readonly #url: string;

	/**
	 * Types of feed
	 */
	public static readonly Types = FeedType;

	/**
	 * @param client Client attached to the BaseFeed
	 * @param url The url for the feed
	 */
	public constructor(client: Client, url: string) {
		this.#client = client;
		this.#url = url;
	}

	/**
	 * Client attached to the Feed
	 */
	public get client(): Client {
		return this.#client;
	}

	/**
	 * Url used for pagination
	 */
	public get url(): string {
		return this.#url;
	}
}

export default BaseFeed;
