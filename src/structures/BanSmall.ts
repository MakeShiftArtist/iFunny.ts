import { Endpoints, type APIBanSmall, type APIBanType } from "@ifunny/ifunny-api-types";
import { Base } from "./Base";
import { User } from "./User";
import type { BaseUser } from "./BaseUser";

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
	public constructor(user: User | BaseUser, payload: APIBanSmall) {
		super(user.client, payload);
		this.#user = user instanceof User ? user : new User(user.client, user.payload);
		this.payload = payload;
		this.endpointUrl = Endpoints.bans(this.#user.id, this.id);
	}

	/**
	 * Date object of when the ban expires
	 */
	public get expiresAt(): Date {
		return new Date(this.get("date_until") * 1000);
	}

	/**
	 * How long until the ban expires in milliseconds
	 */
	public get expiresIn(): number {
		return this.expiresAt.getTime() - new Date().getTime();
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
