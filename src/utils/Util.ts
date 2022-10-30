import {
	RESTAPIErrorResponse,
	RESTAPIItems,
	RESTAPISuccessResponse,
} from "@ifunny/ifunny-api-types";
import axios, { AxiosError, AxiosRequestConfig, AxiosRequestHeaders } from "axios";
import Client from "../client/Client";
import { DefaultBasicAuthConfig } from "./Constants";
import { BasicAuthConfig } from "./Types";
import crypto from "crypto";
import { iFunnyError } from "../errors/iFunnyError";
import { iFunnyErrorCodes } from "../errors/iFunnyErrorCodes";
import { PaginateConfig } from "../structures/BaseFeed";

/**
 * Utility class used by the Client
 */
export class Util {
	/**
	 * Private member for the Client instance
	 */
	readonly #client: Client;

	/**
	 * @param client Client attached to the Utility class
	 */
	constructor(client: Client) {
		this.#client = client;
	}

	/**
	 * Asserts a claim to be true
	 * @param claim The claim to check
	 * @param error The message to send if the claim evaluted to false
	 */
	assert(claim: boolean, error: Error | string): claim is true {
		if (!claim) {
			if (typeof error === "string") {
				throw new Error(error);
			} else if (error instanceof Error) {
				throw error;
			}
		}
		return true;
	}

	/**
	 * Generates a basic token
	 * @param opts Options to create the token with
	 * @param opts.clientId The client id to use for the token
	 * @param opts.clientSecret The client secret to use for the token
	 * @param opts.length The length of the token to create
	 * @returns A basic auth token
	 */
	createBasicAuth(opts?: BasicAuthConfig) {
		const { length, clientId, clientSecret } = Object.assign(
			DefaultBasicAuthConfig,
			opts
		);

		let uuid = crypto.randomUUID().replace(/\-/g, "");
		let hex: string;
		switch (length) {
			case 112:
				hex = uuid.toUpperCase();
				break;
			case 156:
				hex = crypto
					.createHash("sha256")
					.update(uuid)
					.digest("hex")
					.toUpperCase();
				break;
			default:
				throw iFunnyError.new(iFunnyErrorCodes.InvalidBasicTokenLength);
		}

		let a = hex + `_${clientId}:`;
		let b = hex + `:${clientId}:${clientSecret}`;
		let c = crypto.createHash("sha1").update(b).digest("hex");
		return Buffer.from(a + c).toString("base64");
	}

	/**
	 * Returns a Date object from a timestamp
	 * @param timestamp Number of seconds of the timestamp
	 * @param inMilliseconds Whether the timestamp is already in milliseconds or not
	 * @returns
	 */
	dateFromTimestamp(timestamp: number, inMilliseconds: boolean = true): Date {
		// ? Converts timestamp to milliseconds if necessary
		if (!inMilliseconds) timestamp *= 1000;

		return new Date(timestamp);
	}

	/**
	 * Validates that something is an Axios Error
	 * @param item Item to validate
	 */
	isAxiosError<T extends RESTAPIErrorResponse = RESTAPIErrorResponse>(
		item: unknown
	): item is AxiosError<T> {
		return axios.isAxiosError(item);
	}

	/**
	 * Certain requests have a header for 'if-modified-since' which uses the current timestamp
	 * @param date Custom date
	 * @returns GMT timestamp of the date
	 */
	ifModifiedSince(date?: Date): string {
		date ??= new Date();
		return date.toUTCString();
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
		params?: PaginateConfig,
		full: boolean = false
	): AsyncGenerator<T> {
		// Verify config
		if (!url) throw new Error("paginate: url is required");
		if (!key) throw new Error("paginate: key is required");

		// Set method
		let method: "GET" | "POST" = "GET";
		if (url.toLowerCase() === "feeds/collective") {
			method = "POST";
		}

		let hasNext: boolean;
		let data = new URLSearchParams();

		// Set params
		for (const key in params) {
			data.set(key, `${params[key as keyof PaginateConfig]}`);
		}

		// Request config
		let config: AxiosRequestConfig =
			method === "GET" ? { method, url, params: data } : { method, url, data };

		loop: do {
			interface Items {
				[key: string]: RESTAPIItems<T>;
			}
			const response = await this.#client.instance.request<
				RESTAPISuccessResponse<Items>
			>(config);

			const items = response.data?.data?.[key]?.items;
			if (!Array.isArray(items)) throw new Error(`paginate: items is not an array`);

			// Set next param
			hasNext = response.data?.data?.[key]?.paging?.hasNext ?? false;

			if (hasNext) {
				data.set("next", response.data.data[key].paging.cursors.next!);
			}

			// Yield the full data if wanted
			if (full) {
				//console.log("yield full");
				yield response.data as Awaited<T>;
				continue loop;
			}

			for (let item of items) {
				//console.log("yield item");
				yield item;
			}
		} while (hasNext);
	}

	/**
	 * Sleeps the program for the specified amount of milliseconds
	 * @param ms The number of milliseconds to wait
	 * @returns A promise that resolves after the given amount of time
	 */
	async sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Client headers
	 */
	get headers() {
		return this.#client.instance.defaults.headers.common;
	}

	/**
	 * Updates client headers
	 */
	set headers(headers: AxiosRequestHeaders) {
		Object.assign(this.#client.instance.defaults.headers.common, headers);
	}
}

export default Util;
