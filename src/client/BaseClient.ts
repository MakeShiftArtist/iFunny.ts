import { Agent } from "https";
import {
	APIBase,
	APIVersion,
	DefaultHeaders,
	DefaultClientId,
	DefaultClientSecret,
	DefaultBasicTokenLength,
} from "../utils/Constants";
import { APIClientUser as ClientPayload } from "@ifunny/ifunny-api-types";
import { EventEmitter } from "eventemitter3";
import { ICachingOptions } from "node-ts-cache";
import axios, { AxiosInstance, AxiosRequestHeaders } from "axios";

export interface ClientConfig {
	basic: string | null;
	basicLength: 156 | 112;
	bearer: string | null;
	headers: AxiosRequestHeaders;
	clientId: string;
	clientSecret: string;
	cacheConfig: ICachingOptions;
}

export type ClientOptions = Partial<ClientConfig>;

/**
 * Base Client for the Client to extend
 * @extends EventEmitter
 */
export class BaseClient extends EventEmitter {
	/**
	 * The axios instance used for requests
	 * @internal
	 */
	readonly instance: AxiosInstance;

	/**
	 * The payload for the client
	 */
	#payload: Partial<ClientPayload>;

	/**
	 * The config for the client
	 */
	#config: ClientConfig;

	/**
	 * @param config Options to initialize the BaseClient with
	 * @param payload The payload for the client if applicable
	 */
	protected constructor(
		config: ClientOptions = {},
		payload: Partial<ClientPayload> = {}
	) {
		super();
		// Set defaults
		this.#config = Object.assign(BaseClient.DEFAULT_CONFIG, config);

		const headers = Object.assign(DefaultHeaders, config?.headers);

		this.instance = axios.create({
			baseURL: `https://${APIBase}/v${APIVersion}`,
			headers,
			httpsAgent: new Agent({ keepAlive: true }),
		});

		this.#payload = Object.assign({}, payload);
	}

	/**
	 * Default Config for the Client
	 */
	public static readonly DEFAULT_CONFIG: ClientConfig = {
		basic: null,
		basicLength: DefaultBasicTokenLength,
		bearer: null,
		headers: DefaultHeaders,
		clientId: DefaultClientId,
		clientSecret: DefaultClientSecret,
		cacheConfig: {
			ttl: 1000 * 60 * 30,
			isLazy: true,
			isCachedForever: false,
			calculateKey: JSON.stringify,
		},
	};

	/**
	 * Current config for the Client
	 */
	public get config(): ClientConfig {
		return this.#config;
	}

	/**
	 * Gets the payload
	 */
	public get payload(): Partial<ClientPayload> {
		return this.#payload;
	}

	/**
	 * Prevents overwriting the payload
	 */
	public set payload(value: Partial<ClientPayload>) {
		this.#payload = Object.assign(this.payload, value);
	}

	/**
	 * Calls eval with the client set as the "this" context.
	 * @param script The script to evaluate
	 * @returns The result of the script
	 */
	protected _eval(script: string) {
		return eval(script);
	}

	/**
	 * Converts the Client's payload into JSON like data
	 * @returns JSON string representation of the Client
	 */
	public toJSON(): string {
		return JSON.stringify(this.payload, null, 2);
	}

	/**
	 * When concatenated with a string, this automatically returns the user's nick instead of the User object.
	 * @example
	 * console.log(`Hello from ${client}!`); //  Logs: "Hello from iFunnyChef" or "Hello from Guest Client"
	 */
	public override toString(): string {
		return `${this.payload.nick ?? "Guest Client"}`;
	}
}
export default BaseClient;
