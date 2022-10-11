import { APIContent } from "@ifunny/ifunny-api-types";
import Client from "../client/Client";
import { BaseContent } from "./BaseContent";

/**
 * Represents content from iFunny
 */
export class Content extends BaseContent {
	/**
	 * @param client Client attached to the Content
	 * @param payload Payload of the content
	 */
	constructor(client: Client, payload: APIContent) {
		super(client, payload);
	}
}

export default Content;
