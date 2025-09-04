import type { KvStore } from '@nowarajs/kv-store/types';

export interface RateLimitOptions {
	/**
	 * Storage backend for rate limit data.
	 *
	 * - If not specified, defaults to in-memory storage
	 * - Use ':memory:' to explicitly specify in-memory storage
	 * - Provide a KvStore instance for persistent distributed storage
	 */
	readonly store?: ':memory:' | KvStore;
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
