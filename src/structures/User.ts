import { APIContent, APIUser } from "@ifunny/ifunny-api-types";

import { BaseUser } from "./BaseUser";
import { Client } from "../client/Client";
import { Endpoints } from "../utils/Endpoints";

interface TimelineOptions {
	limit?: number;
	original?: boolean;
	next?: string;
}

export class User extends BaseUser {
	constructor(client: Client, id: string, payload?: any) {
		super(client, id, payload);
		this.endpoint_url = Endpoints.user(id);
	}

	/**
	 * Fetches new data about the user from the API
	 * @returns The User instance
	 */
	async fetch() {
		return super.fetch();
	}
}
