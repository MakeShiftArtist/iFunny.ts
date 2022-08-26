import { BaseClient, BaseClientConfig } from "./BaseClient";
import {
	APIClientUser as ClientPayload,
	RESTAPIAccountSuccess,
	RESTAPIErrorResponse,
	RESTAPIOauth2LoginSuccess,
	RESTAPISignUpSuccess,
} from "@ifunny/ifunny-api-types";

import { AxiosResponse } from "axios";
import { Endpoints } from "../utils/Endpoints";
import { If } from "../utils/Util";
import { iFunnyError } from "../errors/iFunnyError";
import { iFunnyErrorCodes } from "../errors/iFunnyErrorCodes";
import { isAxiosError } from "../utils/Methods";

interface ClientConfig extends Partial<BaseClientConfig> {}

/**
 * Client for the Discord API.
 * @extends BaseClient
 */
export class Client<Authorized extends boolean = boolean> extends BaseClient {
	constructor(config?: ClientConfig, payload: Partial<ClientPayload> = {}) {
		super(config, payload);
	}

	public get basic(): string {
		return this._basic;
	}

	public set basic(value: string) {
		this._basic = value;
	}

	/**
	 * The bearer token for the client
	 */
	get bearer(): If<Authorized, string, null> {
		return this._bearer as If<Authorized, string, null>;
	}

	/**
	 * Sets the bearer token for the client. If set to null, the client will not use a bearer token.
	 */
	set bearer(value: string | null) {
		this._bearer = value || null;
		this.instance.defaults.headers.common.Authorization = this.isAuthorized()
			? `Bearer ${this.bearer}`
			: `Basic ${this.basic}`;
	}

	/**
	 * Is the client using a bearer token to make requests?
	 */
	isAuthorized(): this is Client<true> {
		return !!this.bearer;
	}

	async fetch(): Promise<this> {
		if (!this.isAuthorized()) {
			throw new iFunnyError(
				iFunnyErrorCodes.ClientNotLoggedIn,
				"Fetch account data"
			);
		}

		try {
			const response = await this.instance.get<RESTAPIAccountSuccess>(
				Endpoints.account
			);
			console.log(response);

			let data = response.data;
			this.payload = data.data;
			return this;
		} catch (error) {
			if (error instanceof Error && isAxiosError(error)) {
				const resp = error.response as AxiosResponse<RESTAPIErrorResponse>;
				//console.log(JSON.stringify(resp, null, 2));
				switch (error?.response?.status) {
					case 401:
						throw new iFunnyError(
							iFunnyErrorCodes.InvalidGrant,
							resp.data.error_description
						);
				}
				throw error;
			}
			throw error;
		}
	}

	/**
	 * Logs into iFunny with an Email and Password\
	 * If you already have a bearer token, don't use this method
	 * @param email The email to login with
	 * @param password The password to login with
	 * @returns The instance of the client
	 */
	async login(email: string, password: string): Promise<this> {
		if (this.isAuthorized()) {
			return await this.fetch();
		}
		try {
			let response = await this.instance.post<RESTAPIOauth2LoginSuccess>(
				Endpoints.token,
				{
					grant_type: "password",
					username: email,
					password,
				}
			);
			this.bearer = response.data.access_token;
			return await this.fetch();
		} catch (error) {
			if (!(error instanceof Error) || !isAxiosError(error)) throw error;
			const resp = error.response as AxiosResponse<RESTAPIErrorResponse>;
			switch (resp.data.error) {
				case "captcha_required":
					throw new iFunnyError(iFunnyErrorCodes.CaptchaRequired, resp.data);
				default:
					throw new iFunnyError(iFunnyErrorCodes.UnknownError, error);
			}
		}
	}

	/**
	 * Signs up for an iFunny account.
	 * @param nick The nick of the account to sign up with. Checks if the nick is taken.
	 * @param email The email to sign up with. Checks if the email is taken.
	 * @param password The password to sign up with
	 * @param login Should the client login after sign up?
	 * @returns The instance of the client
	 */
	async signUp(
		nick: string,
		email: string,
		password: string,
		acceptMailOffers: boolean = false,
		login: boolean = true
	): Promise<this> {
		let response = await this.instance.post<RESTAPISignUpSuccess>(Endpoints.user(), {
			reg_type: "pwd",
			nick,
			email,
			password,
			accept_mailing: acceptMailOffers ? 1 : 0,
		});
		this.payload.id = response.data.data.id;
		if (login) {
			return await this.login(email, password);
		}
		return this;
	}
}

export default Client;
