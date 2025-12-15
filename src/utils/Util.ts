import { DefaultBasicAuthConfig } from "./Constants";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import crypto from "crypto";
import type { BasicAuthConfig } from "./Types";
import type { Client } from "../client/Client";
import type { PaginateConfig } from "../structures/BaseFeed";
import type {
    RESTAPIErrorResponse,
    RESTAPIItems,
    RESTAPISuccessResponse,
} from "@ifunny/ifunny-api-types";

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
    public constructor(client: Client) {
        this.#client = client;
    }

    /**
     * Asserts a claim to be true
     * @param claim The claim to check
     * @param error The message to send if the claim evaluted to false
     * @internal
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
    public createBasicAuth(opts?: BasicAuthConfig) {
        const { length, clientId, clientSecret } = Object.assign(
            DefaultBasicAuthConfig,
            opts,
        );

        const uuid = crypto.randomUUID().replace(/-/g, "");
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
                throw TypeError("Invalid token length. Expected 112 | 156");
        }

        const a = hex + `_${clientId}:`;
        const b = hex + `:${clientId}:${clientSecret}`;
        const c = crypto.createHash("sha1").update(b).digest("hex");

        return Buffer.from(a + c).toString("base64");
    }

    /**
     * Validates that something is an Axios Error
     * @param item Item to validate
     * @internal
     */
    isAxiosError(item: unknown): item is AxiosError & {
        response: AxiosResponse<unknown>;
    } {
        if (!axios.isAxiosError(item) || !item.response) return false;
        return true;
    }

    /**
     * Validates that an object matches the RESTAPIErrorResponse schema
     * @param error Error to validate
     * @returns error is RESTAPIErrorResponse
     * @internal
     */
    isAPIError(error: unknown): error is RESTAPIErrorResponse {
        if (!this.hasProperty(error, "error")) return false;
        if (!this.hasProperty(error, "error_description")) return false;
        if (!this.hasProperty(error, "status")) return false;
        if (typeof error.error !== "string") return false;
        if (typeof error.error_description !== "string") return false;
        if (typeof error.status !== "number") return false;
        return true;
    }

    /**
     * Certain requests have a header for 'if-modified-since' which uses the current timestamp
     * @param date Custom date
     * @returns GMT timestamp of the date
     * @internal
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
     * @param full Whether to yield the full data or just the items (default false)
     * @yields The value of the key
     * @internal
     */
    async *paginate<T extends unknown>(
        url: string,
        key: string,
        params?: PaginateConfig,
        full: boolean = false,
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
        const data = new URLSearchParams();

        // Set params
        for (const key in params) {
            data.set(key, `${params[key as keyof PaginateConfig]}`);
        }

        // Request config
        const config: AxiosRequestConfig =
            method === "GET"
                ? { method, url, params: data }
                : { method, url, data };

        do {
            interface Items {
                [key: string]: RESTAPIItems<T>;
            }
            const response =
                await this.#client.instance.request<
                    RESTAPISuccessResponse<Items>
                >(config);

            const items = response.data?.data?.[key]?.items;
            if (!Array.isArray(items))
                throw new Error(`paginate: items is not an array`);

            // Set next param
            hasNext = response.data?.data?.[key]?.paging?.hasNext ?? false;

            if (hasNext) {
                data.set("next", response.data.data[key].paging.cursors.next!);
            }

            // Yield the full data if wanted
            if (full) {
                //console.log("yield full");
                yield response.data as Awaited<T>;
                continue;
            }

            for (const item of items) {
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
    public async sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Converts data into a json like string
     * @param data Data to convert to JSON
     * @returns JSON data
     */
    public toJSON(data: unknown): string {
        return JSON.stringify(data, null, 2);
    }

    /**
     * Type guard to validate key existance on an object
     * @param obj Object to check key for
     * @param prop Property to check is defined
     * @returns `obj` has property `prop`
     * @internal
     */
    hasProperty<Obj, Prop extends string>(
        obj: Obj,
        prop: Prop,
    ): obj is Obj & Record<Prop, unknown> {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }
}

export default Util;
