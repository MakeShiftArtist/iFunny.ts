import { BaseUser } from "./BaseUser";
import { Client } from "../client/Client";

interface TimelineOptions {
	limit?: number;
	original?: boolean;
	next?: string;
}

export class User extends BaseUser {
	constructor(client: Client, id: string, payload?: any) {
		super(client, id, payload);
	}

	/**
	 * Fetches new data about the user from the API
	 * @returns The User instance
	 */
	async fetch() {
		return super.fetch();
	}
}
