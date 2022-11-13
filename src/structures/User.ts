import { APIUserProfile } from "@ifunny/ifunny-api-types";
import { BaseUser } from "./BaseUser";
import { Client } from "../client/Client";

/**
 * Represents a user on iFunny
 * @extends BaseUser
 */
export class User extends BaseUser {
	/**
	 * @param client Client instance associated with the User
	 * @param payload Payload of the User
	 */
	constructor(client: Client, payload: APIUserProfile) {
		super(client, payload);
	}
}

export default User;
