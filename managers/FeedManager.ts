import { Client } from "../client/Client";
import { Feed } from "../structures/Feed";

/**
 * Handles different feeds for the Client
 */
export class FeedManager {
	/**
	 * Client attached to the FeedManager
	 */
	readonly #client: Client;
	readonly #features: Feed;
	readonly #collective: Feed;
	readonly #home: Feed;

	/**
	 * @param client Client instance
	 */
	public constructor(client: Client) {
		this.#client = client;
		this.#features = new Feed(this.#client, Feed.Types.FEATURES);
		this.#collective = new Feed(this.#client, Feed.Types.COLLECTIVE);
		this.#home = new Feed(this.#client, Feed.Types.HOME);
	}

	/**
	 * The featured feed
	 */
	public get features(): Feed {
		return this.#features;
	}

	/**
	 * The collective feed
	 */
	public get collective(): Feed {
		return this.#collective;
	}

	/**
	 * The subscriptions feed
	 * @alias home
	 */
	public get subscriptions(): Feed {
		return this.home;
	}

	/**
	 * The home feed
	 * @alias subscriptions
	 */
	public get home(): Feed {
		// This is the url so I included it
		return this.#home;
	}
}

export default FeedManager;
