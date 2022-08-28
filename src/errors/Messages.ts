import { RESTAPIErrorCaptchaRequired } from "@ifunny/ifunny-api-types";
import { iFunnyErrorCodes } from "./iFunnyErrorCodes";

function desc(title: string, description?: string | null, fallback: string = ".") {
	return title + (description ? `: ${description}` : fallback);
}

export const Messages = {
	// Unknown Error
	[iFunnyErrorCodes.UnknownError]: (error: any) =>
		desc("An unknown error occurred", error),

	// Client Setup Errors
	[iFunnyErrorCodes.ClientNotLoggedIn]: (action?: string) =>
		desc("The client needs to be logged in to", action, "do this."),
	[iFunnyErrorCodes.InvalidClient]: (description?: string) =>
		desc("The client is invalid", description),

	// Library Errors
	[iFunnyErrorCodes.InvalidBasicTokenLength]: (description?: string) =>
		desc("The basic token must be 156 or 112 characters long", description),
	[iFunnyErrorCodes.UncaughtAxiosError]: (message: string) =>
		desc("Uncaught axios error", message),

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
	[iFunnyErrorCodes.UserNotFound]: (user?: string) => desc("User not found", user),
	[iFunnyErrorCodes.UserUnavailable]: (user?: string) => desc("User unavailable", user),
};

export default Messages;
