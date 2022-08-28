export enum iFunnyErrorCodes {
	// Unknown Error
	UnknownError,

	// Client Setup Errors
	ClientNotLoggedIn,
	InvalidClient,

	// Library Errors
	InvalidBasicTokenLength,
	UncaughtAxiosError,

	// Auth Errors
	InvalidTokenType,
	InvalidBasicToken,
	InvalidBearerToken,
	InvalidGrant,
	CaptchaRequired,

	// User Errors
	UserNotFound,
	UserUnavailable,
}
