import {
	RESTAPICaptchaType,
	RESTAPIErrorCaptchaRequired,
} from "@ifunny/ifunny-api-types/types";
import Client from "../client/Client";
import { iFunnyError } from "./iFunnyError";

/**
 * Represents a captcha returned by the API
 * * If this is thrown, you need to catch it, open the url in any browser, solve it, then attempt to make the EXACT same request
 * @extends iFunnyError<RESTAPIErrorCaptchaRequired>
 */
export class CaptchaError extends iFunnyError<RESTAPIErrorCaptchaRequired> {
	/**
	 * @param client Client instance
	 * @param error Raw Error returned by the API
	 */
	constructor(client: Client, error: RESTAPIErrorCaptchaRequired) {
		super(client, error);
	}

	/**
	 * The type of the captcha
	 */
	get type(): RESTAPICaptchaType {
		return this.raw.data.type;
	}

	/**
	 * URL to open to solve the captcha.
	 */
	get captcha_url(): string {
		return this.raw.data.captcha_url;
	}
}

export default CaptchaError;
