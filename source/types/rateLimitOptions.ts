import type { Redis } from 'ioredis';

/**
 * Options to configure the rate limit plugin.
 *
 * @example
 * ```ts
 * const options: RateLimitOptions = {
 *   redis: redisInstance, // Your Redis instance
 *   limit: 100,          // Allow 100 requests
 *   window: 60,          // Per 60 seconds
 *   message: 'You have exceeded the rate limit. Please try again later.'
 * };
 * ```
 */
export interface RateLimitOptions {
	/**
	 * Redis instance used for storing rate limit data.
	 */
	readonly redis: Redis;
	/**
	 * Maximum number of requests allowed in the time window.
	 *
	 * This defines how many requests a client can make within the specified time window
	 * before rate limiting is applied.
	 */
	readonly limit: number;
	/**
	 * Time window in seconds during which the request limit applies.
	 *
	 * This defines the duration of the rate limiting window. For example, a window of 60
	 * with a limit of 100 allows 100 requests per minute per client.
	 */
	readonly window: number;
}
