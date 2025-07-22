/**
 * Represents the options for the Pkg error.
 *
 * @template TCause - The type of the cause of the error, which can be any object or error.
 */
export interface PkgErrorOptions<TCause = unknown> {
	/**
	 * The error message describing what went wrong.
	 */
	message?: string;

	/**
	 * A unique key identifying the type of error, useful for localization or error handling.
	 */
	key?: string;

	/**
	 * The HTTP status code associated with the error, typically used in API responses.
	 */
	httpStatusCode?: number;

	/**
	 * The cause of the error, which can be an original error or additional context.
	 */
	cause?: TCause;
}