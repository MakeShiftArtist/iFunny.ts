import { APIContent } from "@ifunny/ifunny-api-types/types";
import Client from "../client/Client";
import { Content } from "./Content";
import BaseFeed, { PaginateConfig } from "./BaseFeed";

/**
 * Represents a feed on iFunny
 * @extends BaseFeed
 */
export class Feed extends BaseFeed {
	/**
	 * @param client Client attached to the Feed
	 * @param url Url for the feed
	 */
	constructor(client: Client, url: string) {
		super(client, url);
	}

	/**
	 * Paginates through content in a feed
	 * @param params Params to pass into the pagination requests - Updates automatically
	 * @param markAsRead Should each post be marked as read after viewing? (Default: false)
	 */
	async *paginate(params?: PaginateConfig, markAsRead: boolean = false) {
		for await (const content of this.client.util.paginate<APIContent>(
			this.url,
			"content",
			Object.assign({ limit: 30 }, params)
		)) {
			if (markAsRead) {
				this.client.content.markAsRead(content.id);
			}
			this.client.content.cache.set(content.id, new Content(this.client, content));

			yield this.client.content.cache.get(content.id) as Content;
		}
	}
}
