import {
	APIBase,
	APIVersion,
	DefaultHeaders,
	DefaultClientId,
	DefaultClientSecret,
} from "../utils/Constants";
import axios, { AxiosInstance, AxiosRequestHeaders } from "axios";

import { Agent } from "https";
import { APIClientUser as ClientPayload } from "@ifunny/ifunny-api-types";
import { EventEmitter } from "eventemitter3";
import { ICachingOptions } from "node-ts-cache";

export interface ClientConfig {
	basic: string | null;
	basic_length: 156 | 112;
	bearer: string | null;
	headers: AxiosRequestHeaders;
	client_id: string;
	client_secret: string;
	cache_config: ICachingOptions;
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

	#payload: Partial<ClientPayload>;

	#config: ClientConfig;

	/**
	 * @param config Options to initialize the BaseClient with
	 * @param payload The payload for the client if applicable
	 */
	public constructor(config: ClientOptions = {}, payload: Partial<ClientPayload> = {}) {
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
		basic_length: 112,
		bearer: null,
		headers: DefaultHeaders,
		client_id: DefaultClientId,
		client_secret: DefaultClientSecret,
		cache_config: {
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
}

export default BaseClient;
