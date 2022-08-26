import {
	APIBase,
	APIVersion,
	DefaultHeaders,
	DefaultUserAgent,
} from "../utils/Constants";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosRequestHeaders } from "axios";

import { Agent } from "https";
import { APIClientUser as ClientPayload } from "@ifunny/ifunny-api-types";
import { EventEmitter } from "eventemitter3";
import { URLSearchParams } from "url";
import { createBasicAuth } from "../utils/Methods";
import { handleError } from "../errors/ErrorHandler";

export interface BaseClientConfig {
	userAgent: string;
	basic: string;
	bearer: string;
	headers: AxiosRequestHeaders;
	clientId: string;
	clientSecret: string;
}

export type BaseClientOptions = Partial<BaseClientConfig>;

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

	protected _basic: string;

	protected _bearer: string | null = null;

	constructor(options: BaseClientOptions = {}, payload: Partial<ClientPayload> = {}) {
		super();
		// Set defaults
		this._basic = options.basic || createBasicAuth();
		this._bearer = options.bearer || null;

		const headers = options?.headers ?? DefaultHeaders;

		headers["user-agent"] = options?.userAgent ?? DefaultUserAgent;
		this.instance = axios.create({
			baseURL: `https://${APIBase}/v${APIVersion}`,
			headers: headers,
			httpsAgent: new Agent({ keepAlive: true }),
		});

		this.instance.interceptors.request.use((config) => {
			config.headers ??= headers;
			config.headers.Authorization = this.authorization;
			//console.log(`set headers:\n ${JSON.stringify(config.headers, null, 2)}`);
			return config;
		});

		this.instance.interceptors.response.use(
			(response) => response,
			(error) => {
				throw handleError(error);
			}
		);

		this._payload = Object.assign({}, payload);
	}

	/**
	 * The authorization string used for requests
	 */
	get authorization() {
		return this._bearer ? `Bearer ${this._bearer}` : `Basic ${this._basic}`;
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

	/**
	 * Paginates through items in a REST API endpoint.
	 * @param url The url to get
	 * @param key The key to get the array of values from
	 * @param params The params to pass to the url
	 * @yields The value of the key
	 */
	public async *paginate<T extends unknown>(
		url: string,
		key: string,
		params?: any
	): AsyncGenerator<T> {
		if (!url) throw new Error("paginate: url is required");
		if (!key) throw new Error("paginate: key is required");

		let method: "GET" | "POST" = "GET";
		if (url.toLowerCase() === "collective") {
			method = "POST";
		}

		let hasNext: boolean;
		if (!params) params = new URLSearchParams();

		let config: AxiosRequestConfig =
			method === "GET"
				? { method, url, params: new URLSearchParams(params) }
				: { method, url, data: params || {} };

		do {
			let { data } = await this.instance.request(config);
			const items = data?.data?.[key]?.items;
			if (!Array.isArray(items)) throw new Error("paginate: items is not an array");

			hasNext = data?.data?.[key]?.paging?.has_next ?? false;
			if (hasNext) {
				params.set("next", data.data[key].paging.cursors.next);
			}

			for (let item of items) {
				yield item;
			}
		} while (hasNext);
	}
}
