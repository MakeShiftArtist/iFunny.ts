import * as crypto from "crypto";

import axios, { AxiosError } from "axios";

import { BasicAuthConfig } from "./Util";
import { DefaultBasicAuthConfig } from "./Constants";
import { RESTAPIErrorResponse } from "@ifunny/ifunny-api-types";
import { iFunnyError } from "../errors/iFunnyError";
import { iFunnyErrorCodes } from "../errors/iFunnyErrorCodes";

/**
 * Certain requests have a header for 'if-modified-since' which uses the current timestamp
 * @param date Custom date
 * @returns GMT timestamp of the date
 */
export function ifModifiedSince(date?: Date): string {
	date ??= new Date();
	return date.toUTCString();
}

/**
 * Asserts a claim to be true
 * @param claim The claim to check
 * @param error The message to send if the claim evaluted to false
 */
export function assert(claim: boolean, error: Error | string): claim is true {
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
 * Validates that something is an Axios Error
 * @param item Item to validate
 */
export function isAxiosError<T extends RESTAPIErrorResponse = RESTAPIErrorResponse>(
	item: unknown
): item is AxiosError<T> {
	return axios.isAxiosError(item);
}

/**
 * Returns a Date object from a timestamp
 * @param timestamp Number of seconds of the timestamp
 * @param inMilliseconds Whether the timestamp is already in milliseconds or not
 * @returns
 */
export function dateFromTimestamp(
	timestamp: number,
	inMilliseconds: boolean = true
): Date {
	// ? Converts timestamp to milliseconds if necessary
	if (!inMilliseconds) timestamp *= 1000;

	return new Date(timestamp);
}

/**
 * Sleeps the program for the specified amount of milliseconds
 * @param ms The number of milliseconds to wait
 * @returns A promise that resolves after the given amount of time
 */
export async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generates a basic token
 * @param opts Options to create the token with
 * @param opts.clientId The client id to use for the token
 * @param opts.clientSecret The client secret to use for the token
 * @param opts.length The length of the token to create
 * @returns
 */
export function createBasicAuth(opts?: BasicAuthConfig) {
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
			hex = crypto.createHash("sha256").update(uuid).digest("hex").toUpperCase();
			break;
		default:
			throw new iFunnyError(iFunnyErrorCodes.InvalidBasicTokenLength);
	}
	let a = hex + `_${clientId}:`;
	let b = hex + `:${clientId}:${clientSecret}`;
	let c = crypto.createHash("sha1").update(b).digest("hex");
	return Buffer.from(a + c).toString("base64");
}
