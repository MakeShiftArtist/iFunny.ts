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
	basicLength: 156 | 112;
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

	public static readonly DEFAULT_CONFIG: ClientConfig = {
		basic: null,
		basicLength: 112,
		bearer: null,
		headers: DefaultHeaders,
		clientId: DefaultClientId,
		clientSecret: DefaultClientSecret,
	};

	public get config() {
		return this.#config;
	}

	/**
	 * Gets the payload
	 */
	public get payload(): Partial<ClientPayload> {
		return this.#payload;
	}

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
