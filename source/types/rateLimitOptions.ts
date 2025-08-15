import type { Redis } from 'ioredis';

/**
 * Options to configure the rate limit plugin.
 *
 * @example
 * ```ts
 * const options: RateLimitOptions = {
 *   store: redisInstance, // Your Redis instance
 *   limit: 100,          // Allow 100 requests
 *   window: 60,          // Per 60 seconds
 * };
 * ```
 */
export interface RateLimitOptions {
	/**
	 * Storage backend for rate limit data.
	 *
	 * - If not specified, defaults to in-memory storage
	 * - Use ':memory:' to explicitly specify in-memory storage
	 * - Provide a Redis instance for persistent distributed storage
	 */
	readonly store?: ':memory:' | Redis;
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
