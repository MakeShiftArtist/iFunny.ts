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
 * An object that can contain any JSON value, as well as nested JSON objects and arrays.
 */
export interface JSONObject {
    /**
     * An index signature that allows any string key and either a JSON value, a JSON object, or an array of JSON objects.
     */
    [key: string]: JSONValue | JSONObject | JSONObject[];
}

/**
 * A type that conditionally selects one of two types based on a boolean value.
 * @template T - The boolean value to test.
 * @template A - The type to select if T is true.
 * @template B - The type to select if T is false.
 */
export type If<T extends boolean, A, B = null> = T extends true
    ? A
    : T extends false
      ? B
      : A | B;

export type BasicAuthLength = 112 | 156;

/**
 * Configuration options for basic authentication.
 */
export type BasicAuthConfig = {
    /**
     * The client ID to use for authentication.
     */
    clientId: string;
    /**
     * The client secret to use for authentication.
     */
    clientSecret: string;
    /**
     * The length of the authentication token to generate (112 or 156)
     */
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
