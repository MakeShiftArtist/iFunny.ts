import { APIBasePayload } from "@ifunny/ifunny-api-types";
import { Client } from "../client/Client";
import { Nullify } from "../utils/Util";

const DefaultObjectEndpoint = "/account";

/**
 * Base class for all structures.
 */
export class Base<Payload extends APIBasePayload> {
	/**
	 * Client instance attached to the Object
	 */
	private readonly _client: Client;
	/**
	 * The payload of the object.
	 */
	protected _payload: Partial<Payload>;
	/**
	 * Endpoint url the object will request to
	 */
	private _endpoint_url: string = DefaultObjectEndpoint;

	/**
	 * @param client The client instance
	 * @param payload The payload of the object
	 */
	constructor(client: Client, id: string, payload: Partial<Payload> = {}) {
		this._client = client;

		this._payload = payload ?? { id: id };
	}

	/**
	 * The client instance attached to the Object
	 */
	public get client() {
		return this._client;
	}

	/**
	 * Get the payload of the object
	 */
	public get payload() {
		return this._payload;
	}

	/**
	 * Updates the payload of the object.
	 * @param payload The payload to merge into the current instance
	 * @returns The current instance
	 */
	set payload(payload: Partial<Payload>) {
		this._payload = Object.assign(this.payload, payload);
	}

	/**
	 * Endpoint url for requests to update the payload
	 */
	protected get endpoint_url(): string {
		return this._endpoint_url;
	}

	protected set endpoint_url(value: string) {
		this._endpoint_url = `${value}`;
	}

	/**
	 * Fetches the objects data from it's endpoint
	 * @returns The instance of the object
	 */
	async fetch(): Promise<this> {
		const response = await this.client.instance.get(this.endpoint_url);
		return (this.payload = response.data.data);
	}

	/**
	 * Gets the value from the payload from its key
	 * @param key The key to get the value of
	 * @returns
	 */
	protected get<P extends Payload, K extends keyof P>(key: K): Nullify<P[K]> {
		// @ts-ignore
		return (this.payload[key] ?? null) as Nullify<P[K]>;
	}

	/**
	 * The unique id of the object
	 */
	get id() {
		return this.get("id") as string;
	}

	/**
	 * Creates a new instance of the same structure with the same payload.
	 * @returns A clone of the current instance
	 */
	protected _clone(): this {
		return Object.assign(Object.create(this), this);
	}

	valueOf() {
		return this.id;
	}

	/**
	 *
	 * @returns Converts the
	 */
	toJSON() {
		return JSON.stringify(this.payload, null, 2);
	}
}
