import Client from "../client/Client";

/**
 * All feed times
 */
enum FeedType {
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
	#client: Client;
	/**
	 * Url for the feed
	 */
	#url: string;

	/**
	 * Types of feed
	 */
	static readonly Types = FeedType;

	/**
	 * @param client Client attached to the BaseFeed
	 * @param url The url for the feed
	 */
	constructor(client: Client, url: string) {
		this.#client = client;
		this.#url = url;
	}

	/**
	 * Client attached to the Feed
	 */
	get client() {
		return this.#client;
	}

	/**
	 * Url used for pagination
	 */
	get url() {
		return this.#url;
	}
}

export default BaseFeed;
