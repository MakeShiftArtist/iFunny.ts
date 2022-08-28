export enum iFunnyErrorCodes {
	// Unknown Error
	UnknownError,

	// Client Setup Errors
	ClientNotLoggedIn,
	InvalidClient,

	// Auth Errors
	InvalidTokenType,
	InvalidBasicToken,
	InvalidBearerToken,
	InvalidGrant,
	CaptchaRequired,

	// Library Errors
	InvalidBasicTokenLength,

	// User Errors
	UserNotFound,
	UserUnavailable,
}
