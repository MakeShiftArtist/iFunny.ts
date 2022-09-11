import { Messages } from "./Messages";
import { iFunnyErrorCodes } from "./iFunnyErrorCodes";

function makeError(Base: typeof Error) {
	/**
	 * A class for representing an error thrown by iFunny.ts
	 */
	return class iFunnyError extends Base {
		/**
		 * The error code for the error
		 */
		#code: iFunnyErrorCodes;
		/**
		 * @param code The error code for the error
		 * @param args Args to pass into the message formatter function
		 */
		constructor(code: iFunnyErrorCodes, ...args: any[]) {
			super(message(code, args));
			this.#code = code;
			Error.captureStackTrace?.(this, iFunnyError);
		}

		/**
		 * The error code for the error
		 */
		get code() {
			return this.#code;
		}

		/**
		 * The type of error
		 */
		get error() {
			return iFunnyErrorCodes[this.code];
		}

		/**
		 * The name of the error
		 */
		override get name() {
			return `iFunny${super.name} - ${iFunnyErrorCodes[this.code]} [${this.code}]`;
		}

		createMessage<K extends keyof typeof Messages>(
			code: K,
			...args: ResolveArgs<K>
		): string {
			return message(code, ...args);
		}

		static new<K extends keyof typeof Messages>(code: K, ...args: ResolveArgs<K>) {
			return new iFunnyError(code, ...args);
		}

		/**
		 * Easily create an unknown error
		 * @param error Unknown error to turn into iFunny Error
		 * @returns
		 */
		static unknown(error: unknown) {
			return iFunnyError.new(iFunnyErrorCodes.UnknownError, error);
		}
	};
}

/**
 * Format the message for an error.
 * @param code The error code
 * @param args Arguments to pass for util format or as function args
 * @returns Formatted string
 */
function message<K extends keyof typeof Messages>(
	code: K,
	...args: ResolveArgs<K>
): string {
	if (typeof code !== "number")
		throw new Error("Error code must be a valid iFunnytsErrorCode");
	const msg = Messages[code];
	if (!msg) throw new Error(`An invalid error code was used: ${code}.`);
	// @ts-ignore
	if (typeof msg === "function") return msg(...args); // TODO: Fix this resolving to 1 function instead of union of functions
	return msg;
}

/**
 * Resolves arguments from Messages by its key
 */
type ResolveArgs<K extends keyof typeof Messages> = typeof Messages[K] extends (
	...args: any[]
) => string
	? Parameters<typeof Messages[K]>
	: any[];

export const iFunnyError = makeError(Error);
export const iFunnyTypeError = makeError(TypeError);
export const iFunnyRangeError = makeError(RangeError);
export const iFunnyErrorMessage = message;
