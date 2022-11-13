import {
	IFUNNY_ERRORS,
	RESTAPIErrorCaptchaRequired,
	RESTAPIErrorResponse,
	RESTAPIiFunnyError,
} from "@ifunny/ifunny-api-types";
import { CaptchaError } from "./CaptchaError";
import { Client } from "../client/Client";

/**
 * A class for representing an error thrown by iFunny.ts
 * @extends Error
 */
export class iFunnyError<
	APIError extends RESTAPIErrorResponse = RESTAPIErrorResponse
> extends Error {
	#error: APIError;
	readonly #client: Client;

	/**
	 * @param client Client instance attached to the Error
	 * @param error The error thrown by the API
	 */
	constructor(client: Client, error: APIError) {
		super(error.error_description);
		this.#client = client;
		if (iFunnyError.isRawCaptchaError(client, error)) {
			this.message += error.data.captcha_url;
		}
		this.#error = error;

		Error.captureStackTrace?.(this, iFunnyError);
	}

	/**
	 * Client instance that threw the error
	 */
	public get client(): Client {
		return this.#client;
	}

	/**
	 * The error code for the error
	 */
	get code(): RESTAPIiFunnyError {
		return this.raw.error;
	}

	/**
	 * Status code returned by the API
	 */
	get status() {
		return this.raw.status;
	}

	/**
	 * Raw error returned by the API
	 */
	get raw() {
		return this.#error;
	}

	/**
	 * The name of the error
	 */
	override get name() {
		return `${this.constructor.name} - ${this.code} [${this.status}]`;
	}

	/**
	 * Type guards an object into an iFunnyError
	 * @param error Object to type guard
	 * @returns error is iFunnyError
	 */
	public static isiFunnyError(error: unknown): error is iFunnyError {
		return error instanceof iFunnyError;
	}

	/**
	 * Type guards an object into captcha like error
	 * @param client Client instance to use util class for
	 * @param error Error response from AxiosError#response#data
	 * @internal
	 */
	static isRawCaptchaError(
		client: Client,
		error: unknown
	): error is RESTAPIErrorCaptchaRequired {
		if (!client.util.isAPIError(error)) return false;
		if (error.error !== IFUNNY_ERRORS.CAPTCHA_REQUIRED) return false;
		if (!client.util.hasProperty(error, "data")) return false;
		if (!client.util.hasProperty(error.data, "captcha_url")) return false;
		if (!client.util.hasProperty(error.data, "type")) return false;
		if (typeof error.data.type !== "string") return false;
		if (typeof error.data.captcha_url !== "string") return false;
		return true;
	}

	/**
	 *
	 * @param error Error to validate
	 * @returns
	 */
	public static isCaptchaError(error: unknown): error is CaptchaError {
		return error instanceof CaptchaError;
	}

	isCaptchaError(): this is CaptchaError;
	isCaptchaError(error: unknown): error is CaptchaError;
	isCaptchaError(error?: unknown) {
		return iFunnyError.isCaptchaError(error ?? this);
	}
}
