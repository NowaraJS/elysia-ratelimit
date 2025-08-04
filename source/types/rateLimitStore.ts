/**
 * Common interface for rate limit storage backends (Memory, Redis, etc.).
 */
export interface RateLimitStore {
	/**
	 * Get value for a key.
	 */
	get(key: string): string | null | Promise<string | null>;

	/**
	 * Set key with expiration.
	 */
	setex(key: string, seconds: number, value: string): void | Promise<void>;

	/**
	 * Increment key value.
	 */
	incr(key: string): number | Promise<number>;

	/**
	 * Get time to live for key.
	 */
	ttl(key: string): number | Promise<number>;
}
