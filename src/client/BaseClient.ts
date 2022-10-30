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

export interface ClientConfig {
	basic: string | null;
	bearer: string | null;
	headers: AxiosRequestHeaders;
	clientId: string;
	clientSecret: string;
}

export type ClientOptions = Partial<ClientConfig>;

/**
 * Base Client for the Client to extend
 * @extends EventEmitter
 */
export class BaseClient extends EventEmitter {
	/**
	 * The axios instance used for requests
	 */
	public readonly instance: AxiosInstance;

	protected _payload: Partial<ClientPayload>;

	#config: ClientConfig;

	/**
	 * @param config Options to initialize the BaseClient with
	 * @param payload The payload for the client if applicable
	 */
	constructor(config: ClientOptions = {}, payload: Partial<ClientPayload> = {}) {
		super();
		// Set defaults
		this.#config = Object.assign(BaseClient.DefaultConfig, config);

		const headers = Object.assign(DefaultHeaders, config?.headers);

		this.instance = axios.create({
			baseURL: `https://${APIBase}/v${APIVersion}`,
			headers,
			httpsAgent: new Agent({ keepAlive: true }),
		});

		this.instance.interceptors.request.use((config) => {
			config ??= {};
			config.headers ??= headers;
			config.headers.Authorization = this.authorization;

			return config;
		});

		this._payload = Object.assign({}, payload);
	}

	static DefaultConfig: ClientConfig = {
		basic: null,
		bearer: null,
		headers: DefaultHeaders,
		clientId: DefaultClientId,
		clientSecret: DefaultClientSecret,
	};

	get config() {
		return this.#config;
	}

	/**
	 * The authorization string used for requests
	 */
	get authorization() {
		return this.config.bearer
			? `Bearer ${this.config.bearer}`
			: `Basic ${this.config.basic}`;
	}

	/**
	 * Gets the payload
	 */
	get payload(): Partial<ClientPayload> {
		return this._payload;
	}

	set payload(value: Partial<ClientPayload>) {
		this._payload = Object.assign(this.payload, value);
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
