import {
	APIFeedFrom,
	Endpoints,
	IFUNNY_ERRORS,
	RESTAPIContentResponse,
	RESTAPIStatusCode,
} from "@ifunny/ifunny-api-types";
import { CachedManager } from "./CachedManager";
import { Client } from "../client/Client";
import { Content } from "../structures/Content";
import { iFunnyError } from "../errors/iFunnyError";
import { ICachingOptions } from "node-ts-cache";

/**
 * Manages content for the Client
 */
export class ContentManager extends CachedManager<typeof Content> {
	constructor(client: Client, cacheConfig: ICachingOptions) {
		super(client, Content, cacheConfig);
	}

	/**
	 * Fetches Content by its Id
	 * @param id Id of the content
	 * @param cached Should we return the Cached item? (Default: `true`)
	 * @returns Content
	 */
	async fetch(id: Content | string, cached: boolean = true): Promise<Content | null> {
		try {
			let content = await this.resolve(id);
			if (content && cached) return content;

			const { data } = await this.client.instance.get<RESTAPIContentResponse>(
				`content/${id}`
			);

			content = new Content(this.client, data.data);
			this.cache.set(content.id, content, this.cache.config);
			return content;
		} catch (error) {
			if (!iFunnyError.isiFunnyError(error)) throw error;

			if (error.code === IFUNNY_ERRORS.NOT_FOUND) {
				return null;
			} else throw error;
		}
	}

	/**
	 * Mark content as read.
	 * @param content Content to mark as read
	 * @param from Where the content was marked as read.
	 */
	async markAsRead(
		content: Content | string | (Content | string)[],
		from?: APIFeedFrom
	): Promise<boolean> {
		const items = Array.isArray(content)
			? content
					.map((c) => {
						if (typeof c === "string") return c;
						return c.id;
					})
					.join(",")
			: content instanceof Content
			? content.id
			: content;

		const response = await this.client.instance.request<RESTAPIStatusCode>({
			method: "PUT",
			url: Endpoints.reads(items),
			params: new URLSearchParams({ from: from as string }),
		});

		return response.data.status == 200;
	}
}

export default ContentManager;
