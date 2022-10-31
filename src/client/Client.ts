import { BaseClient } from "./BaseClient";
import {
	APIClientUser as ClientPayload,
	Endpoints,
	RESTAPIOauth2LoginSuccess,
	RESTAPISignUpSuccess,
	RESTAPISuccessResponse as Success,
} from "@ifunny/ifunny-api-types";

import { APIClientUser } from "@ifunny/ifunny-api-types";
import { If } from "../utils/Types";
import { UserManager } from "../managers/UserManager";
import { iFunnyError } from "../errors/iFunnyError";
import { iFunnyErrorCodes } from "../errors/iFunnyErrorCodes";
import { Util } from "../utils/Util";
import { ClientOptions } from "./BaseClient";
import { FeedManager } from "../managers/FeedManager";
import { handleError } from "../errors/ErrorHandler";
import ContentManager from "../managers/ContentManager";

/**
 * Client for the iFunny API.
 * @extends BaseClient
 */
export class Client<Authorized extends boolean = boolean> extends BaseClient {
	/**
	 * User manager object
	 */
	readonly #users: UserManager;
	/**
	 * Feed manager object
	 */
	readonly #feeds: FeedManager;
	/**
	 * Content manager object
	 */
	readonly #content: ContentManager;

	/**
	 * Client utility class
	 */
	readonly #util: Util;

	/**
	 * @param config The config for the Client
	 * @param payload Payload for the client if applicable
	 */
	constructor(config?: ClientOptions, payload: Partial<ClientPayload> = {}) {
		super(config, payload);
		this.#util = new Util(this);
		this.#users = new UserManager(this);
		this.#feeds = new FeedManager(this);
		this.#content = new ContentManager(this);

		this.instance.interceptors.response.use(
			(onSuccess) => onSuccess,
			(onFail) => {
				const error = handleError(this, onFail);
				if (error instanceof Error) throw error;
				return error;
			}
		);
	}

	/**
	 * Utility class for the client
	 */
	get util() {
		return this.#util;
	}

	/**
	 * Basic token used by the client.\
	 * If not set in constructor, one was generated
	 */
	public get basic(): string {
		return (
			this.config.basic ||
			this.util.createBasicAuth({
				clientId: this.config.clientId,
				clientSecret: this.config.clientSecret,
				length: this.config.basicLength,
			})
		);
	}

	public set basic(value: string) {
		this.config.basic = value;
	}

	/**
	 * The bearer token for the client
	 */
	get bearer(): If<Authorized, string, null> {
		return this.config.bearer as If<Authorized, string, null>;
	}

	/**
	 * Sets the bearer token for the client. If set to null, the client will not use a bearer token.
	 */
	set bearer(value: string | null) {
		this.config.bearer = value || null;
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
			throw new iFunnyError(iFunnyErrorCodes.Unauthorized, "Fetch account data");
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
		return this.#users;
	}

	/**
	 * The content feeds for the Client
	 */
	get feeds() {
		return this.#feeds;
	}

	/**
	 * The Client's Content manager
	 */
	get content() {
		return this.#content;
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

		const auth = `Basic ${this.basic}`;
		const data = new FormData();
		data.set("grant_type", "password");
		data.set("username", email);
		data.set("password", password);
		let response = await this.instance.post<RESTAPIOauth2LoginSuccess>(
			Endpoints.token,
			data,
			{
				headers: {
					accept: "application/json",
					applicationstate: 1,
					authorization: auth,
					connection: "Keep-Alive",
					"content-type": "application/x-www-form-urlencoded",
				},
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
		const data = new FormData();
		data.set("reg_type", "pwd");
		data.set("nick", nick);
		data.set("email", email);
		data.set("password", password);
		data.set("accept_mailing", acceptMailOffers ? "1" : "0");

		let response = await this.instance.post<RESTAPISignUpSuccess>(
			Endpoints.user(),
			data.toString()
		);

		this.payload.id = response.data.data.id;
		if (login) {
			return await this.login(email, password);
		}
		return this;
	}
}

export default Client;
