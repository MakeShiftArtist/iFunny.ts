import type { Client } from "../client/Client";

/**
 * The type of iFunny feed.
 */
export enum FeedType {
	/**
	 * The featured feed, which contains popular and trending content.
	 */
	FEATURES = "feeds/featured",
	/**
	 * The collective feed, which contains all content uploaded to iFunny.
	 */
	COLLECTIVE = "feeds/collective",
	/**
	 * The home feed, which contains content from the user's subscriptions and recommendations.
	 */
	HOME = "timelines/home",
	/**
	 * A user's personal timeline feed, which contains their own content.
	 */
	TIMELINE = "timelines/users",
}

/**
 * Configuration options for paginating iFunny API responses.
 */
export interface PaginateConfig {
	/**
	 * The maximum number of items to include in the response.
	 * If not specified, the default limit will be used.
	 */
	limit?: number;
	/**
	 * Is the Client a new user?
	 * ? Seems to only be for server side use.
	 */
	is_new?: boolean;
	/**
	 * A URL-encoded string representing the cursor for the next page of results.
	 * This should be set to the value of the `next` property from the previous response.
	 */
	next?: string;
	/**
	 * A URL-encoded string representing the cursor for the previous page of results.
	 * This should be set to the value of the `prev` property from the previous response.
	 */
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
