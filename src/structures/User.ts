import { BaseUser } from "./BaseUser";
import { Client } from "../client/Client";

export class User extends BaseUser {
	constructor(client: Client, id: string, payload?: any) {
		super(client, id, payload);
	}
}
