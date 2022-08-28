import { BaseClient, BaseClientConfig } from "./BaseClient";
import {
	APIClientUser as ClientPayload,
	Endpoints,
	RESTAPIOauth2LoginSuccess,
	RESTAPISignUpSuccess,
	RESTAPISuccessResponse as Success,
} from "@ifunny/ifunny-api-types";

import { APIClientUser } from "@ifunny/ifunny-api-types";
import { If } from "../utils/Util";
import { UserManager } from "../managers/UserManager";
import { iFunnyError } from "../errors/iFunnyError";
import { iFunnyErrorCodes } from "../errors/iFunnyErrorCodes";

interface ClientConfig extends Partial<BaseClientConfig> {}

/**
 * Client for the Discord API.
 * @extends BaseClient
 */
export class Client<Authorized extends boolean = boolean> extends BaseClient {
	/**
	 * User manager object
	 */
	private _users: UserManager;

	constructor(config?: ClientConfig, payload: Partial<ClientPayload> = {}) {
		super(config, payload);
		this._users = new UserManager(this);
	}

	public get basic(): string {
		return this._basic;
	}

	public set basic(value: string) {
		this._basic = value;
	}

	/**
	 * The bearer token for the client
	 */
	get bearer(): If<Authorized, string, null> {
		return this._bearer as If<Authorized, string, null>;
	}

	/**
	 * Sets the bearer token for the client. If set to null, the client will not use a bearer token.
	 */
	set bearer(value: string | null) {
		this._bearer = value || null;
		this.instance.defaults.headers.common.Authorization = this.isAuthorized()
			? `Bearer ${this.bearer}`
			: `Basic ${this.basic}`;
	}

	/**
	 * Is the client using a bearer token to make requests?
	 */
	isAuthorized(): this is Client<true> {
		return !!this.bearer;
	}

	/**
	 * Updates the Client's payload
	 * @returns The Client instance
	 */
	async fetch(): Promise<this> {
		if (!this.isAuthorized()) {
			throw new iFunnyError(
				iFunnyErrorCodes.ClientNotLoggedIn,
				"Fetch account data"
			);
		}

		const response = await this.instance.get<Success<APIClientUser>>(
			Endpoints.account
		);

		let data = response.data;
		this.payload = data.data;
		return this;
	}

	/**
	 * The client's user manager
	 */
	get users() {
		return this._users;
	}

	/**
	 * Logs into iFunny with an Email and Password\
	 * If you already have a bearer token, don't use this method
	 * @param email The email to login with
	 * @param password The password to login with
	 * @returns The instance of the client
	 */
	async login(email: string, password: string): Promise<this> {
		if (this.isAuthorized()) {
			return await this.fetch();
		}

		let response = await this.instance.post<RESTAPIOauth2LoginSuccess>(
			Endpoints.token,
			{
				grant_type: "password",
				username: email,
				password,
			}
		);
		this.bearer = response.data.access_token;
		return await this.fetch();
	}

	/**
	 * Signs up for an iFunny account.
	 * @param nick The nick of the account to sign up with. Checks if the nick is taken.
	 * @param email The email to sign up with. Checks if the email is taken.
	 * @param password The password to sign up with
	 * @param login Should the client login after sign up?
	 * @returns The instance of the client
	 */
	async signUp(
		nick: string,
		email: string,
		password: string,
		acceptMailOffers: boolean = false,
		login: boolean = true
	): Promise<this> {
		let response = await this.instance.post<RESTAPISignUpSuccess>(Endpoints.user(), {
			reg_type: "pwd",
			nick,
			email,
			password,
			accept_mailing: acceptMailOffers ? 1 : 0,
		});
		this.payload.id = response.data.data.id;
		if (login) {
			return await this.login(email, password);
		}
		return this;
	}
}

export default Client;
