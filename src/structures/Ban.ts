import { APIBan, Endpoints } from "@ifunny/ifunny-api-types";

import { Base } from "./Base";
import { Client } from "../client/Client";
import { User } from "./User";

/**
 * Represents a Ban on iFunny
 */
export class Ban extends Base<APIBan> {
	/**
	 * User the Ban belongs to
	 */
	private readonly _user: User;

	/**
	 * @param client The Client instance
	 * @param user User or Id of the user that the ban belongs to
	 * @param id Id of the ban itself
	 * @param payload Payload of the ban if applicable
	 */
	constructor(client: Client, user: User, payload: APIBan) {
		super(client, payload);
		this._user = user;
		this.payload = payload;
		this.endpoint_url = Endpoints.bans(this._user.id, this.id);
	}

	/**
	 * Timestamp (in seconds) of when it expires
	 */
	get expiresAtTimestamp() {
		let ms = this.get("date_until");
		return typeof ms === "number" ? ms * 1000 : null;
	}

	/**
	 * Date object of when the ban expires
	 */
	get expiresAt() {
		let ms = this.expiresAtTimestamp;
		return ms ? new Date(ms) : null;
	}

	/**
	 * How long (in seconds) until the ban expires
	 */
	get expiresInTimestamp() {
		let ms = this.expiresAtTimestamp;
		return ms ? ms - new Date().getTime() : null;
	}

	/**
	 * Date object of how much ms is left until the ban expires
	 */
	get expiresIn() {
		let ms = this.expiresInTimestamp;
		return ms ? new Date(ms) : null;
	}

	/**
	 * The type of the ban
	 */
	get type() {
		return this.get("type");
	}

	/**
	 * User that the ban belongs to
	 */
	get user() {
		return this._user;
	}
}
