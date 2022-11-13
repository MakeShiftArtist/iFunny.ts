import { APIBanSmall, APIBanType, Endpoints } from "@ifunny/ifunny-api-types";
import { Base } from "./Base";
import { Client } from "../client/Client";
import { User } from "./User";

/**
 * Represents a Ban on iFunny
 * @extends Base<APIBanSmall>
 */
export class BanSmall extends Base<APIBanSmall> {
	/**
	 * User the Ban belongs to
	 */
	readonly #user: User;

	/**
	 * @param client The Client instance
	 * @param user User or Id of the user that the ban belongs to
	 * @param payload Payload of the ban if applicable
	 */
	constructor(client: Client, user: User, payload: APIBanSmall) {
		super(client, payload);
		this.#user = user;
		this.payload = payload;
		this.endpoint_url = Endpoints.bans(this.#user.id, this.id);
	}

	/**
	 * Date object of when the ban expires
	 */
	public get expires_at(): Date {
		return new Date(this.get("date_until") * 1000);
	}

	/**
	 * How long until the ban expires in milliseconds
	 */
	public get expires_in(): number {
		return this.expires_at.getTime() - new Date().getTime();
	}

	/**
	 * The type of the ban
	 */
	public get type(): APIBanType {
		return this.get("type");
	}

	/**
	 * User that the ban belongs to
	 */
	public get user(): User {
		return this.#user;
	}
}

export default BanSmall;
