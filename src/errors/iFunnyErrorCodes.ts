export enum iFunnyErrorCodes {
	// Unknown Error
	UnknownError,

	// Client Errors
	InvalidClient,
	InvalidEmail,
	Unauthorized,

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
	InvalidUserId,
	UserNotFound,
	UserUnavailable,
	UserDeleted,

	// Content Errors
	ContentNotFound,
}
