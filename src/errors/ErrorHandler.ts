import {
	IFUNNY_ERRORS,
	RESTAPIErrorBadRequest,
	RESTAPIErrorCaptchaRequired,
	RESTAPIErrorNotFound,
	RESTAPIErrorResponse,
} from "@ifunny/ifunny-api-types";
import { AxiosResponse } from "axios";
import Client from "../client/Client";

import { iFunnyError } from "./iFunnyError";
import { iFunnyErrorCodes } from "./iFunnyErrorCodes";

function handleCaptcha(data: RESTAPIErrorCaptchaRequired) {
	return iFunnyError.new(iFunnyErrorCodes.CaptchaRequired, data);
}

/**
 * Handles bad requests errors
 * @param response AxiosResponse instance
 * @returns Error
 */
function handleBadRequest(response: AxiosResponse<RESTAPIErrorBadRequest>) {
	switch (response.data.error_description) {
		case "Invalid user id":
			return iFunnyError.new(iFunnyErrorCodes.UserNotFound, response.config.url);
		default:
			return iFunnyError.new(
				iFunnyErrorCodes.UnknownError,
				response.data.error_description
			);
	}
}

function handleNotFound(response: AxiosResponse<RESTAPIErrorNotFound>) {
	const message = response.data.error_description;
	switch (true) {
		case /(?<=User with nick )(\S+)(?= not found)/g.test(message):
		case /(?<=Unable to find user with id: )(\S{24})/g.test(message):
			return iFunnyError.new(iFunnyErrorCodes.UserNotFound, message);

		case /Content not found/g.test(message):
			return iFunnyError.new(
				iFunnyErrorCodes.ContentNotFound,
				response.config.url!
			);
		default:
			return iFunnyError.unknown(JSON.stringify(response.data, null, 2));
	}
}

/**
 * Handles an error returned by the iFunny error
 * @param response {@link RESTAPIErrorResponse}
 */
export function handleAPIError(response: AxiosResponse<RESTAPIErrorResponse>) {
	// TODO: Handle all errors
	switch (response.data.error) {
		case IFUNNY_ERRORS.BAD_REQUEST:
			return handleBadRequest(response as AxiosResponse<RESTAPIErrorBadRequest>);

		case IFUNNY_ERRORS.CAPTCHA_REQUIRED:
			return handleCaptcha(response.data);

		case IFUNNY_ERRORS.UNAUTHORIZED:
			return iFunnyError.new(
				iFunnyErrorCodes.Unauthorized,
				response.data.error_description
			);

		case IFUNNY_ERRORS.INVALID_EMAIL:
		case IFUNNY_ERRORS.EMAIL_EXISTS:
			return iFunnyError.new(
				iFunnyErrorCodes.InvalidEmail,
				response.data.error_description
			);

		case IFUNNY_ERRORS.NOT_FOUND:
			return handleNotFound(response as AxiosResponse<RESTAPIErrorNotFound>);

		case IFUNNY_ERRORS.INVALID_GRANT:
			return iFunnyError.new(
				iFunnyErrorCodes.InvalidGrant,
				`${response.data.error_description} - ${response.config.headers}`
			);

		case IFUNNY_ERRORS.INVALID_CLIENT:
			return iFunnyError.new(
				iFunnyErrorCodes.InvalidClient,
				`${response.data.error_description} - ${response.request.config}`
			);

		default:
			return iFunnyError.new(
				iFunnyErrorCodes.UnknownError,
				JSON.stringify(response.data, null, 2)
			);
	}
}

/**
 * Handles errors thrown when making axios requests
 * @param error Error to handle
 * @returns `null` or custom iFunnyError
 */
export function handleError(client: Client, error: unknown) {
	if (!(error instanceof Error)) throw iFunnyError.unknown(error);
	if (!client.util.isAxiosError(error)) {
		throw error;
	}
	if (error.response?.data) {
		return handleAPIError(error.response);
	}
	return iFunnyError.new(iFunnyErrorCodes.UncaughtAxiosError, error);
}
