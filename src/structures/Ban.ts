import { APIBanType, APIBan as BanPayload, Endpoints } from "@ifunny/ifunny-api-types";

import { Base } from "./Base";
import { Client } from "../client/Client";
import { User } from "./User";

/**
 * Represents a Ban on iFunny
 */
export class Ban extends Base<BanPayload> {
	/**
	 * Id of the user the ban is attached to
	 */
	private readonly _user: User;

	/**
	 * @param client The Client instance
	 * @param user User or Id of the user that the ban belongs to
	 * @param id Id of the ban itself
	 * @param payload Payload of the ban if applicable
	 */
	constructor(
		client: Client,
		user: User | string,
		id: string,
		payload: Partial<BanPayload> = {}
	) {
		super(client, id, payload);
		this._user = user instanceof User ? user : new User(client, user);
		this.payload = payload;
		this.endpoint_url = Endpoints.bans(this._user.id, id);
	}

	/**
	 * Timestamp (in seconds) of when it expires
	 */
	get expiresAtTimestamp() {
		let time = this.get("date_until");
		return typeof time === "number" ? time * 1000 : null;
	}

	/**
	 * Date object of when the ban expires
	 */
	get expiresAt() {
		let time = this.expiresAtTimestamp;
		return time ? new Date(time) : null;
	}

	/**
	 * How long (in seconds) until the ban expires
	 */
	get expiresInTimestamp() {
		let time = this.expiresAtTimestamp;
		return time ? time - new Date().getTime() : null;
	}

	/**
	 * Date object of how much time is left until the ban expires
	 */
	get expiresIn() {
		let time = this.expiresInTimestamp;
		return time ? new Date(time) : null;
	}

	/**
	 * The type of the ban
	 */
	get type() {
		return this.get("type") as APIBanType | null;
	}

	/**
	 * User that the ban belongs to
	 */
	get user() {
		return this._user;
	}
}
