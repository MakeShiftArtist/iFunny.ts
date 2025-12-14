import {
	APIClientUser,
	Endpoints,
	RESTAPIOauth2LoginSuccess,
	RESTAPISignUpSuccess,
	RESTAPISuccessResponse as Success,
} from "@ifunny/ifunny-api-types";
import { BaseClient } from "./BaseClient";
import { CaptchaError } from "../errors/CaptchaError";
import { ClientOptions } from "./BaseClient";
import { ContentManager } from "../managers/ContentManager";
import { FeedManager } from "../managers/FeedManager";
import { If } from "../utils/Types";
import { iFunnyError } from "../errors/iFunnyError";
import { UserManager } from "../managers/UserManager";
import { Util } from "../utils/Util";
import FormData from "form-data";
import { AppManager } from "../managers/AppManager";
import User from "../structures/User";

/**
 * Method params for Client#signUp()
 */
export interface SignUpOptions {
	/**
	 * The nick to use when creating the account
	 */
	nick: string;
	/**
	 * Email / Username for the account
	 */
	email: string;
	/**
	 * Password for the account
	 */
	password: string;
	/**
	 * Should the Client sign up for mail offers? Never set this to true you weirdo
	 */
	acceptMailing?: boolean;
	/**
	 * Should the Client login to the account after creating it?
	 */
	login?: boolean;
}

/**
 * Client for the iFunny API.
 * @extends BaseClient
 * @template Authorized
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
	readonly #app: AppManager;
	#user: User | null = null;

	/**
	 * Client utility class
	 */
	readonly #util: Util;

	/**
	 * @param config The config for the Client
	 * @param payload Payload for the client if applicable
	 */
	public constructor(
		config?: ClientOptions,
		payload: Partial<APIClientUser> = {}
	) {
		super(config, payload);
		this.#util = new Util(this);
		this.#users = new UserManager(this, this.config.cacheConfig);
		this.#content = new ContentManager(this, this.config.cacheConfig);
		this.#feeds = new FeedManager(this);
		this.#app = new AppManager(this);

		this.instance.interceptors.request.use((config) => {
			config.headers.set(this.config.headers);
			config.headers.Authorization ??= this.authorization;
			return config;
		});

		this.instance.interceptors.response.use(
			(onSuccess) => onSuccess,
			(onFail) => {
				if (!this.util.isAxiosError(onFail) || !onFail.response) throw onFail;
				if (!this.util.isAPIError(onFail.response.data)) throw onFail;
				if (iFunnyError.isRawCaptchaError(this, onFail.response.data)) {
					throw new CaptchaError(this, onFail.response.data);
				}
				throw new iFunnyError(this, onFail.response.data);
			}
		);
	}

	/**
	 * Utility class for the client
	 */
	public get util(): Util {
		return this.#util;
	}

	/**
	 * Basic token used by the client.\
	 * If not set in constructor, one was generated
	 */
	public get basic(): string {
		return (this.config.basic ||= this.util.createBasicAuth({
			clientId: this.config.clientId,
			clientSecret: this.config.clientSecret,
			length: this.config.basicLength,
		}));
	}

	/**
	 * Sets the basic token for the Client. Must be a string
	 */
	public set basic(value: string) {
		this.config.basic = value;
	}

	/**
	 * Prime the Client's basic token
	 * @returns The Client's basic token
	 */
	public async primeBasic(): Promise<string>;
	/**
	 * Primes a basic token without updating the Client config. This takes ~15 seconds
	 * @param basic Basic token to prime
	 * @returns Basic token being primed
	 */
	public async primeBasic(basic: string): Promise<string>;
	public async primeBasic(basic?: string): Promise<string> {
		await this.instance.get(Endpoints.counters, {
			headers: { Authorization: `Basic ${(basic ??= this.basic)}` },
		});
		// ? Takes ~15 seconds to prime the basic token
		await this.util.sleep(1000 * 15);
		return basic;
	}

	/**
	 * The bearer token for the client
	 */
	public get bearer(): If<Authorized, string, null> {
		return this.config.bearer as If<Authorized, string, null>;
	}

	/**
	 * Sets the bearer token for the client. If set to null, the client will not use a bearer token.
	 */
	public set bearer(value: string | null) {
		this.config.bearer = value || null;
		this.instance.defaults.headers.common.Authorization = this.isAuthorized()
			? `Bearer ${this.bearer}`
			: `Basic ${this.basic}`;
	}

	/**
	 * The authorization string used for requests
	 */
	public get authorization(): string {
		return this.bearer ? `Bearer ${this.bearer}` : `Basic ${this.basic}`;
	}

	/**
	 * Is the client using a bearer token to make requests?
	 */
	public isAuthorized(): this is Client<true> {
		return !!this.bearer;
	}

	/**
	 * Updates the Client's payload
	 * @returns The Client instance
	 */
	public async fetch(): Promise<this> {
		if (!this.isAuthorized()) {
			throw new Error(
				"Client is not authorized with a bearer token. Please generate one with Client#login"
			);
		}

		const response = await this.instance.get<Success<APIClientUser>>(
			Endpoints.account
		);

		const data = response.data;
		this.payload = data.data;
		return this;
	}

	/**
	 * The client's user manager
	 */
	public get users(): UserManager {
		return this.#users;
	}

	/**
	 * The content feeds for the Client
	 */
	public get feeds(): FeedManager {
		return this.#feeds;
	}

	/**
	 * The Client's Content manager
	 */
	public get content(): ContentManager {
		return this.#content;
	}

	/**
	 * Manage the client's application data like settings or features
	 */
	public get app(): AppManager {
		return this.#app;
	}

	/**
	 * Asynchronously gets the authorized user or null if not authorized.
	 * @returns A promise that resolves to the client user or null.
	 */
	public async user(): Promise<If<Authorized, User, null>> {
		if (!this.isAuthorized()) {
			return null as If<Authorized, User, null>;
		}
		await this.fetch();
		return (this.#user ??= await this.users.fetch(this.id)) as If<
			Authorized,
			User,
			null
		>;
	}

	/**
	 * Logs in using the stored bearer token.\
	 * Does NOT Generate a new bearer token
	 */
	public async login(): Promise<this>;
	/**
	 * Logs the Client in an generates a new Bearer token.\
	 * If a bearer token is stored, these are ignored
	 * @param email The email to log in with
	 * @param password The password to log in with
	 */
	public async login(email: string, password: string): Promise<this>;
	public async login(email?: string, password?: string): Promise<this> {
		if (this.isAuthorized()) {
			return await this.fetch();
		}

		if (!email || !password) {
			throw new TypeError(
				"email and password are required if a bearer hasn't been set"
			);
		}
		const auth = `Basic ${this.basic}`;
		const data = new FormData();
		data.append("grant_type", "password");
		data.append("username", email);
		data.append("password", password);
		const response = await this.instance.post<RESTAPIOauth2LoginSuccess>(
			Endpoints.token,
			data,
			{
				headers: Object.assign(
					{
						accept: "application/json",
						applicationstate: 1,
						authorization: auth,
						connection: "Keep-Alive",
						"content-type": "application/x-www-form-urlencoded",
					},
					data.getHeaders()
				),
			}
		);
		this.bearer = response.data.access_token;
		return await this.fetch();
	}

	/**
	 * Signs up for an iFunny account.
	 * @param options.nick The nick of the account to sign up with. Checks if the nick is taken.
	 * @param options.email The email to sign up with. Checks if the email is taken.
	 * @param options.password The password to sign up with
	 * @param options.acceptMailOffers Should the Client sign up for the mailing list. Never set this to true.
	 * @param options.login Should the client login after sign up? (Default: true)
	 * @returns The instance of the client
	 */
	public async signUp(options: SignUpOptions): Promise<this> {
		const data = new FormData();
		data.append("reg_type", "pwd");
		data.append("nick", options.nick);
		data.append("email", options.email);
		data.append("password", options.password);
		data.append("accept_mailing", !!options.acceptMailing ? "1" : "0");

		const response = await this.instance.post<RESTAPISignUpSuccess>(
			Endpoints.user(),
			data,
			{ headers: data.getHeaders() }
		);

		this.payload.id = response.data.data.id;
		if (options.login ?? true) {
			return await this.login(options.email, options.password);
		}

		return this;
	}

	protected get<K extends keyof APIClientUser>(
		key: K
	): If<Authorized, APIClientUser[K], null> {
		return (this.payload?.[key] ?? null) as If<
			Authorized,
			APIClientUser[K],
			null
		>;
	}

	public get about() {
		return this.get("about");
	}

	public get id() {
		return this.get("id");
	}
}

export default Client;
