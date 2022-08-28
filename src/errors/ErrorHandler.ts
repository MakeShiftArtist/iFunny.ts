import {
	IFUNNY_ERRORS,
	RESTAPIErrorBadRequest,
	RESTAPIErrorCaptchaRequired,
	RESTAPIErrorResponse,
} from "@ifunny/ifunny-api-types";

import { iFunnyError } from "./iFunnyError";
import { iFunnyErrorCodes } from "./iFunnyErrorCodes";
import { isAxiosError } from "../utils/Methods";

function handleCaptcha(data: RESTAPIErrorCaptchaRequired) {
	return iFunnyError.new(iFunnyErrorCodes.CaptchaRequired, data);
}

/**
 * Handles bad requests errors
 * @param error Bad request error data
 * @returns
 */
function handleBadRequest(error: RESTAPIErrorBadRequest) {
	switch (error.error_description) {
		case "Invalid user id":
			// ? User with that ID does not exist
			return null;
		default:
			return iFunnyError.new(
				iFunnyErrorCodes.UnknownError,
				error.error_description
			);
	}
}

/**
 * Handles an error returned by the iFunny error
 * @param error {@link RESTAPIErrorResponse}
 * @returns
 */
export function handleAPIError(error: RESTAPIErrorResponse) {
	switch (error.error) {
		case IFUNNY_ERRORS.BAD_REQUEST:
			// @ts-ignore
			return handleBadRequest(error);

		case IFUNNY_ERRORS.CAPTCHA_REQUIRED:
			return handleCaptcha(error);

		default:
			return iFunnyError.new(
				iFunnyErrorCodes.UnknownError,
				error.error_description
			);
	}
}

/**
 * Handles errors thrown when making axios requests
 * @param error Error to handle
 * @returns `null` or custom iFunnyError
 */
export function handleError(error: unknown) {
	if (!isAxiosError(error)) {
		return iFunnyError.unknown(error);
	}
	if (error.response?.data) {
		return handleAPIError(error.response.data);
	}
	return iFunnyError.new(iFunnyErrorCodes.UncaughtAxiosError, error.message);
}
