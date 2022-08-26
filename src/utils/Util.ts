/**
 * All primitive types in JS
 */
export type Primitive = string | number | boolean | null | undefined;

/**
 * Primitives that are not undefined
 */
export type SafePrimitive = Exclude<Primitive, undefined>;

/**
 * Array that can be safely used in a JSON object
 */
export interface JSONArray extends Array<JSONValue> {}

/**
 * Value that can be safely used in a JSON object
 */
export type JSONValue = SafePrimitive | JSONArray | JSONObject;

/**
 * JSON safe plain object
 */
export interface JSONObject {
	[key: string]: JSONValue | JSONObject | JSONObject[];
}

/**
 * Conditional type that can be checked at compile time
 */
export type If<T extends boolean, A, B = null> = T extends true
	? A
	: T extends false
	? B
	: A | B;

export type BasicAuthLength = 112 | 156;

export type BasicAuthConfig = {
	clientId: string;
	clientSecret: string;
	length: BasicAuthLength;
};
