import {
	Endpoints,
	type APIContent,
	type APIFeedFrom,
	type RESTAPIContentSmileResponse,
	type RESTAPIContentSmileUsersResponse,
	APIComment,
} from "@ifunny/ifunny-api-types";
import { BaseContent } from "./BaseContent";
import { SimpleUser } from "./SimpleUser";
import { Comment } from "./Comment";
import type { Client } from "../client/Client";
import type { URLSearchParams } from "url";

export type ModifyParams =
	| { from?: APIFeedFrom; limit?: number }
	| URLSearchParams;

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
	async #modifySmiles(
		method: "PUT" | "DELETE",
		type: "smiles" | "unsmiles",
		params?: ModifyParams
	): Promise<boolean> {
		const response =
			await this.client.instance.request<RESTAPIContentSmileResponse>({
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
		return await this.#modifySmiles("PUT", "smiles", { from });
	}

	/**
	 * Removes the Client's smile
	 * @param from Where the action occured
	 * @returns Was it success
	 */
	public async removeSmile(from?: APIFeedFrom) {
		return await this.#modifySmiles("DELETE", "smiles", { from });
	}

	/**
	 * Unsmiles the post
	 * @param from Where the action occured
	 * @returns Was it success
	 */
	public async unsmile(from?: APIFeedFrom) {
		return await this.#modifySmiles("PUT", "unsmiles", { from });
	}

	/**
	 * Removes the Client's unsmile
	 * @param from Where the content was smiled
	 * @returns Was the content marked as smiled
	 */
	public async removeUnsmile(from?: APIFeedFrom) {
		return await this.#modifySmiles("DELETE", "unsmiles", { from });
	}

	/**
	 * Attempts to delete the content
	 * @returns Whether the attempt was successful
	 */
	public async delete(): Promise<boolean> {
		if (!this.author?.id || !this.client.id) {
			// console.log("Can't validate author or client");
			return false;
		}

		if (this.author.id !== this.client.id) {
			// console.log("Author's don't match");
			return false;
		}

		type ContentDeletionResponse = {
			status: number;
			data: {
				retry_after: number;
				id: string;
				type: string;
				state: string;
			};
		};

		let response = await this.client.instance.request<ContentDeletionResponse>({
			method: "DELETE",
			url: Endpoints.content(this.id),
		});
		// console.log(response.data);
		return response.data.status === 200;
	}

	/**
	 * Paginate through the comments of the content
	 * @param limit How many comments to return per request (Default: `30`)
	 * @returns AsyncGenerator<Comment>
	 */
	async *comments(limit: number = 30): AsyncGenerator<Comment> {
		for await (const comment of this.client.util.paginate<APIComment>(
			Endpoints.comments(this.id),
			"comments",
			{
				limit,
			},
			false
		)) {
			yield new Comment(this, comment);
		}
	}
}

export default Content;
