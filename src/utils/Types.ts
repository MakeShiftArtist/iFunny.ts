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
	client_id: string;
	client_secret: string;
	length: BasicAuthLength;
};

/**
 * Replaces `undefined` in Union Types with `null`
 * @example
 * interface FooBar {
 * 	foo?: string,
 * 	bar?: number,
 * 	spam: boolean
 * }
 *
 * function foobar<K extends keyof Foobar>(key: K, obj: FooBar) {
 * 	return (obj[key] ?? null) as Nullify<FooBar[K]>
 * }
 *
 * const FooBarVar: FooBar = {
 * 	foo: '420',
 * 	bar: 69,
 * 	spam: true
 * }
 *
 * foobar('foo', FooBar) // string | null
 * foobar('bar', FooBar) // number | null
 * foobar('spam', FooBar) // boolean
 */
export type Nullify<T> = T extends undefined ? null : T;
