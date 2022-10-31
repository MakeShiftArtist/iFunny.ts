import { RESTAPIErrorCaptchaRequired } from "@ifunny/ifunny-api-types";
import { AxiosError } from "axios";
import { iFunnyErrorCodes } from "./iFunnyErrorCodes";

function desc(title: string, description?: any, fallback: string = ".") {
	return title + (description ? `: ${description}` : fallback);
}

export const Messages = {
	// Unknown Error
	[iFunnyErrorCodes.UnknownError]: (error: any) =>
		desc("An unknown error occurred", error),

	// Client Setup Errors
	[iFunnyErrorCodes.InvalidClient]: (description?: string) =>
		desc("The client is invalid", description),
	[iFunnyErrorCodes.InvalidEmail]: (description: string) => description,
	[iFunnyErrorCodes.Unauthorized]: (description?: string) =>
		desc("Client unauthorized to make request", description),

	// Library Errors
	[iFunnyErrorCodes.InvalidBasicTokenLength]: (description?: string) =>
		desc("The basic token must be 156 or 112 characters long", description),
	[iFunnyErrorCodes.UncaughtAxiosError]: (error: AxiosError) =>
		desc("Uncaught axios error", error),

	// Auth Errors
	[iFunnyErrorCodes.InvalidTokenType]: (tokenType?: string) =>
		desc("Invalid token type", tokenType),
	[iFunnyErrorCodes.InvalidBasicToken]: (token?: string) =>
		desc("An invalid basic token was provided", token),
	[iFunnyErrorCodes.InvalidBearerToken]: (token?: string) =>
		desc("An invalid bearer token was provided", token),
	[iFunnyErrorCodes.InvalidGrant]: (description?: string) =>
		desc("Invalid Auth Token", description),
	[iFunnyErrorCodes.CaptchaRequired]: (data: RESTAPIErrorCaptchaRequired) =>
		desc("A captcha is required", data.data.captcha_url),

	// User Errors
	[iFunnyErrorCodes.InvalidUserId]: (id?: string) => desc("Invalid user id", id),
	[iFunnyErrorCodes.UserNotFound]: (description?: string) => description,
	[iFunnyErrorCodes.UserUnavailable]: (user?: string) => desc("User unavailable", user),
	[iFunnyErrorCodes.UserDeleted]: (user?: string) => desc("User was deleted", user),

	// Content Errors
	[iFunnyErrorCodes.ContentNotFound]: (id: string) => desc("Content not found", id),
};

export default Messages;
