import { APIUser } from "@ifunny/ifunny-api-types";
import { BaseUser } from "./BaseUser";
import { Client } from "../client/Client";

export class User extends BaseUser {
	constructor(client: Client, payload: APIUser) {
		super(client, payload);
	}
}
