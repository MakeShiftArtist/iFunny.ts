import {
	APIActionLocation,
	Endpoints,
	RESTAPIContentResponse,
	RESTAPIStatusCode,
} from "@ifunny/ifunny-api-types";
import Client from "../client/Client";
import { iFunnyError } from "../errors/iFunnyError";
import { iFunnyErrorCodes } from "../errors/iFunnyErrorCodes";
import Content from "../structures/Content";
import { CachedManager } from "./CachedManager";

/**
 * Manages content for the Client
 */
export class ContentManager extends CachedManager<typeof Content> {
	constructor(client: Client) {
		super(client, Content);
	}

	/**
	 * Fetches Content by its Id
	 * @param id Id of the content
	 * @returns Content
	 */
	async fetch(id: Content | string, cached: boolean = true): Promise<Content | null> {
		try {
			let content = this.resolve(id);
			if (content && cached) return content;
			const { data } = await this.client.instance.get<RESTAPIContentResponse>(
				`content/${id}`
			);
			content = new Content(this.client, data.data);
			this.cache.set(content.id, content);
			return content;
		} catch (error) {
			if (!(error instanceof iFunnyError)) throw error;

			if (error.code === iFunnyErrorCodes.ContentNotFound) {
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
		from?: APIActionLocation
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
