import { APIContent } from "@ifunny/ifunny-api-types";
import { Base } from "./Base";
import Client from "../client/Client";
import { User } from "./User";

export class BaseContent extends Base<APIContent> {
	private _creator: User | null = null;
	constructor(client: Client, id: string, payload: Partial<APIContent>) {
		super(client, id, payload);
		this.payload = payload;
	}

	/**
	 * The ID of the Content.
	 */
	public get id(): string {
		return super.id;
	}

	public get creator() {
		if (this._creator) return this._creator;
		let user = this.get("creator");
		user ? (this._creator = new User(this.client, user.id, user)) : null;
	}
}
