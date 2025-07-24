export interface RateLimitErrorOptions<T = unknown> {
	/**
	 * The error message describing what went wrong.
	*/
	readonly message?: string;

	/**
	 * The HTTP status code associated with the error, typically used in API responses.
	*/
	readonly httpStatusCode?: number;

	/**
	 * The cause of the error, which can be an original error or additional context.
	*/
	readonly cause?: T;
}