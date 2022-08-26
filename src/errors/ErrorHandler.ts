import {
	RESTAPIError as APIError,
	RESTAPICaptchaError as CaptchaError,
} from "@ifunny/ifunny-api-types";

import { iFunnyError } from "./iFunnyError";
import { iFunnyErrorCodes } from "./iFunnyErrorCodes";
import { isAxiosError } from "../utils/Methods";

function handleCaptcha(data: CaptchaError) {
	return new iFunnyError(iFunnyErrorCodes.CaptchaRequired, data);
}

export function handleAPIError(error: APIError) {
	switch (error.error) {
		case "captcha_required":
			return handleCaptcha(error as CaptchaError);
		case "unknown_error":
			return new iFunnyError(
				iFunnyErrorCodes.UnknownError,
				`(${error.status}) ${error.error_description}`
			);
		default:
			return new iFunnyError(
				iFunnyErrorCodes.UnknownError,
				JSON.stringify(error, null, 2)
			);
	}
}

export function handleError(error: unknown) {
	if (!(error instanceof Error)) {
		return new iFunnyError(iFunnyErrorCodes.UnknownError, error);
	}
	if (isAxiosError(error) && error.response?.data) {
		return handleAPIError(error.response.data as APIError);
	} else return error;
}
