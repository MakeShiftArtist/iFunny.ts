import { APIContent } from "@ifunny/ifunny-api-types";
import { BaseFeed, PaginateConfig } from "./BaseFeed";
import { Client } from "../client/Client";
import { Content } from "./Content";

/**
 * Represents a feed on iFunny
 * @extends BaseFeed
 */
export class Feed extends BaseFeed {
	/**
	 * @param client Client attached to the Feed
	 * @param url Url for the feed
	 */
	public constructor(client: Client, url: string) {
		super(client, url);
	}

	/**
	 * Scrolls through content in a feed from left to right
	 * @param params Params to pass into the pagination requests - Updates automatically
	 * @param markAsRead Should each post be marked as read after viewing? (Default: false)
	 */
	public async *scroll(params?: PaginateConfig, markAsRead: boolean = false) {
		for await (const api_content of this.client.util.paginate<APIContent>(
			this.url,
			"content",
			Object.assign({ limit: 30 }, params)
		)) {
			if (markAsRead) {
				this.client.content.mark_as_read(api_content.id);
			}
			const content = new Content(this.client, api_content);

			this.client.content.cache.set(content.id, content);

			yield content;
		}
	}
}

export default Feed;
