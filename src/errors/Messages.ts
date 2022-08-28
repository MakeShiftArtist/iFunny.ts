import { RESTAPICaptchaError } from "@ifunny/ifunny-api-types";
import { iFunnyErrorCodes } from "./iFunnyErrorCodes";

function desc(title: string, description?: string | null, fallback: string = ".") {
	return title + (description ? `: ${description}` : fallback);
}

export const Messages = {
	// Unknown Error
	[iFunnyErrorCodes.UnknownError]: (error: any) =>
		`An unknown error occurred: ${error}`,

	// Client Setup Errors
	[iFunnyErrorCodes.ClientNotLoggedIn]: (action?: string) =>
		desc("The client needs to be logged in to", action, "do this."),
	[iFunnyErrorCodes.InvalidClient]: (description?: string) =>
		desc("The client is invalid", description),

	// Auth Errors
	[iFunnyErrorCodes.InvalidTokenType]: (tokenType?: string) =>
		desc("Invalid token type", tokenType),
	[iFunnyErrorCodes.InvalidBasicToken]: () => "An invalid basic token was provided.",
	[iFunnyErrorCodes.InvalidBearerToken]: () => "An invalid bearer token was provided.",
	[iFunnyErrorCodes.InvalidGrant]: (description: string) => `${description}`,
	[iFunnyErrorCodes.CaptchaRequired]: (data: RESTAPICaptchaError) =>
		`A captcha is required. Open this url in a browser then retry request: ${data.data.captcha_url}`,

	// Library Errors
	[iFunnyErrorCodes.InvalidBasicTokenLength]: () =>
		"The basic token must be 156 or 112 characters long.",

	// User Errors
	[iFunnyErrorCodes.UserNotFound]: (description: string) => description,
	[iFunnyErrorCodes.UserUnavailable]: (description: string) => description,
};

export default Messages;
