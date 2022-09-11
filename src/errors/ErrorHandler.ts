import {
	IFUNNY_ERRORS,
	RESTAPIErrorBadRequest,
	RESTAPIErrorCaptchaRequired,
	RESTAPIErrorNotFound,
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
			return null;
		default:
			return iFunnyError.new(
				iFunnyErrorCodes.UnknownError,
				error.error_description
			);
	}
}

function handleNotFound(error: RESTAPIErrorNotFound) {
	const message = error.error_description;
	if (
		message.startsWith("User with nick") ||
		message.startsWith("Unable to find user with id: ")
	) {
		return iFunnyError.new(iFunnyErrorCodes.UserNotFound, message);
	} else {
		return iFunnyError.unknown(error.error_description);
	}
}

/**
 * Handles an error returned by the iFunny error
 * @param error {@link RESTAPIErrorResponse}
 */
export function handleAPIError(error: RESTAPIErrorResponse) {
	// TODO: Handle all errors
	switch (error.error) {
		case IFUNNY_ERRORS.BAD_REQUEST:
			return handleBadRequest(error);

		case IFUNNY_ERRORS.CAPTCHA_REQUIRED:
			return handleCaptcha(error);
		case IFUNNY_ERRORS.UNAUTHORIZED:
			return iFunnyError.new(
				iFunnyErrorCodes.Unauthorized,
				error.error_description
			);
		case IFUNNY_ERRORS.INVALID_EMAIL:
		case IFUNNY_ERRORS.EMAIL_EXISTS:
			return iFunnyError.new(
				iFunnyErrorCodes.InvalidEmail,
				error.error_description
			);
		case IFUNNY_ERRORS.NOT_FOUND:
			return handleNotFound(error);
		default:
			return iFunnyError.new(
				iFunnyErrorCodes.UnknownError,
				// @ts-ignore
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
