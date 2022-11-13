import {
	APIContent,
	APIFeedFrom,
	Endpoints,
	RESTAPIContentSmileResponse,
	RESTAPIContentSmileUsersResponse,
} from "@ifunny/ifunny-api-types";
import { BaseContent } from "./BaseContent";
import { Client } from "../client/Client";
import { SimpleUser } from "./SimpleUser";
import { URLSearchParams } from "url";

type ModifyParams = { from?: APIFeedFrom; limit?: number } | URLSearchParams;

/**
 * Represents content from iFunny
 * @extends BaseContent
 */
export class Content extends BaseContent {
	/**
	 * @param client Client attached to the Content
	 * @param payload Payload of the content
	 */
	public constructor(client: Client, payload: APIContent) {
		super(client, payload);
	}

	/**
	 * Helper method to modify smiles for the content
	 * @param method HTTP method
	 * @param type `smiles` or `unsmiles`
	 * @param params Params to pass to the request
	 * @internal
	 */
	async #modify_smiles(
		method: "PUT" | "DELETE",
		type: "smiles" | "unsmiles",
		params?: ModifyParams
	): Promise<boolean> {
		const response = await this.client.instance.request<RESTAPIContentSmileResponse>({
			method,
			url: Endpoints[type](this.id),
			params,
		});

		// Update payload
		this.payload.num.smiles = response.data.data.num_smiles;
		this.payload.num.unsmiles = response.data.data.num_unsmiles;
		this.payload.num.guest_smiles = response.data.data.num_guest_smiles;

		return response.data.status == 200;
	}

	/**
	 * Cycles through users that smiled the post
	 * @param limit How many users to return per request (Default: `30`)
	 */
	public async *smiles(limit: number = 30) {
		for await (const data of this.client.util.paginate<RESTAPIContentSmileUsersResponse>(
			Endpoints.smiles(this.id),
			"users",
			{ limit },
			true
		)) {
			for (const user of data.data.users.items) {
				this.payload.num.smiles = data.data.smiles_count;
				this.payload.num.guest_smiles = data.data.guest_smiles_count;
				yield new SimpleUser(this.client, user);
			}
		}
	}

	/**
	 * Smiles the post
	 * @param from Where the action occured
	 * @returns Was it success
	 */
	public async smile(from?: APIFeedFrom) {
		return await this.#modify_smiles("PUT", "smiles", { from });
	}

	/**
	 * Removes the Client's smile
	 * @param from Where the action occured
	 * @returns Was it success
	 */
	public async remove_smile(from?: APIFeedFrom) {
		return await this.#modify_smiles("DELETE", "smiles", { from });
	}

	/**
	 * Unsmiles the post
	 * @param from Where the action occured
	 * @returns Was it success
	 */
	public async unsmile(from?: APIFeedFrom) {
		return await this.#modify_smiles("PUT", "unsmiles", { from });
	}

	/**
	 * Removes the Client's unsmile
	 * @param from Where the content was smiled
	 * @returns Was the content marked as smiled
	 */
	public async remove_unsmile(from?: APIFeedFrom) {
		return await this.#modify_smiles("DELETE", "unsmiles", { from });
	}
}

export default Content;
