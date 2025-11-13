import { HttpError } from '@nowarajs/error';
import { MemoryStore } from '@nowarajs/kv-store/memory';
import type { KvStore } from '@nowarajs/kv-store/types';
import type { Server } from 'bun';
import { Elysia, type HTTPHeaders, type StatusMap } from 'elysia';

import { RATE_LIMIT_ERROR_KEYS } from './enums/rate-limit-error-keys';
import type { RateLimitOptions } from './types/rate-limit-options';

/**
 * Rate limiting plugin for Elysia applications that protects APIs from excessive use and potential abuse.
 *
 * The plugin tracks request rates by client IP address and enforces configurable limits based on a fixed time window.
 * It supports multiple storage backends through the `@nowarajs/kv-store` ecosystem for both single-instance and distributed deployments.
 *
 * ### How It Works
 * - Rate limiting is applied per IP address and per route
 * - Each route can have its own limit and time window configuration
 * - Route-level rate limits override global rate limits
 * - Headers are added to all responses indicating the current rate limit status
 *
 * ### Rate Limit Headers
 * The plugin adds the following headers to all responses (including 429 errors):
 * - `X-RateLimit-Limit`: The maximum number of requests allowed in the window
 * - `X-RateLimit-Remaining`: The number of requests remaining in the current window
 * - `X-RateLimit-Reset`: The time in seconds until the rate limit resets (Unix timestamp)
 *
 * When a rate limit is exceeded, the response includes a 429 (Too Many Requests) status code
 * and the error key `elysia.rate-limit.error.exceeded`, along with the rate limit headers
 * to help clients implement exponential backoff retry strategies.
 *
 * @param store - The KV store instance for tracking rate limits. Defaults to an in-memory store.
 * Supports any `KvStore` implementation from `@nowarajs/kv-store` (e.g., `MemoryStore`, `IoRedisStore`)
 *
 * @returns An {@link Elysia} plugin that adds rate limiting functionality via the `rateLimit` macro
 *
 * @example
 * Basic usage with default in-memory store (development)
 * ```ts
 * import { rateLimit } from '@nowarajs/elysia-ratelimit';
 * import { Elysia } from 'elysia';
 *
 * const app = new Elysia()
 *   .use(rateLimit())
 *   .get('/api/data', () => ({ message: 'Hello World' }), {
 *     rateLimit: {
 *       limit: 100,         // 100 requests
 *       window: 60          // per minute
 *     }
 *   })
 *   .listen(3000);
 * ```
 *
 * @example
 * Using Redis store for distributed rate limiting (production)
 * ```ts
 * import { IoRedisStore } from '@nowarajs/kv-store';
 * import { rateLimit } from '@nowarajs/elysia-ratelimit';
 * import { Elysia } from 'elysia';
 *
 * const redisStore = new IoRedisStore({
 *   host: 'localhost',
 *   port: 6379
 * });
 * await redisStore.connect();
 *
 * const app = new Elysia()
 *   .use(rateLimit(redisStore))
 *   .get('/api/endpoint', () => ({ data: 'content' }), {
 *     rateLimit: {
 *       limit: 1000,        // 1000 requests
 *       window: 3600        // per hour
 *     }
 *   })
 *   .listen(3000);
 * ```
 *
 * @example
 * Global rate limit with route-level overrides
 * ```ts
 * const app = new Elysia()
 *   .use(rateLimit())
 *   .guard({
 *     rateLimit: {
 *       limit: 100,
 *       window: 60
 *     }
 *   })
 *   .get('/api/slow', () => 'content', {
 *     rateLimit: {
 *       limit: 10,          // Override global: stricter limit
 *       window: 60
 *     }
 *   })
 *   .get('/api/fast', () => 'content')  // Uses global limit
 *   .listen(3000);
 * ```
 *
 * @throws ({@link HttpError}) – `elysia.rate-limit.error.exceeded` when the rate limit is exceeded (HTTP 429)
 */
export const rateLimit = (store: KvStore = new MemoryStore()) => {
	const restrictedRoutes = new Map<string, RateLimitOptions>();

	const rateLimitCheck = async (
		key: string,
		limit: number,
		window: number,
		set: {
			headers: HTTPHeaders,
			status?: number | keyof StatusMap;
		}
	) => {
		// trick to allow macro overrides
		if (set.headers['X-RateLimit-Limit'])
			return;
		let count = (await store.get<number>(key)) ?? 0;

		if (count === 0) {
			await store.set(key, 1, window);
			count = 1;
		} else {
			count = await store.increment(key);
		}

		const remaining = Math.max(0, limit - count);
		const resetTime = await store.ttl(key);

		set.headers = {
			'X-RateLimit-Limit': limit.toString(),
			'X-RateLimit-Remaining': remaining.toString(),
			'X-RateLimit-Reset': resetTime.toString()
		};

		if (count > limit) {
			set.status = 429;
			throw new HttpError(RATE_LIMIT_ERROR_KEYS.RATE_LIMIT_EXCEEDED, 'TOO_MANY_REQUESTS', {
				limit,
				window,
				remaining: 0,
				reset: resetTime
			});
		}
	};

	return new Elysia({
		name: 'rateLimit',
		seed: {
			store
		}
	})
		.macro({
			rateLimit: ({ limit, window }: RateLimitOptions) => ({
				transform: ({ request }) => {
					const route = `${request.method}:${(new URL(request.url)).pathname}`;
					if (!restrictedRoutes.has(route)) {
						restrictedRoutes.set(route, { limit, window });
					} else if (restrictedRoutes.has(route)) {
						const existing = restrictedRoutes.get(route) as RateLimitOptions;
						if (limit != existing.limit || window != existing.window)
							restrictedRoutes.set(route, {
								limit,
								window
							});
					}
				},
				beforeHandle: (async ({ set, request, server }) => {
					const route = `${request.method}:${(new URL(request.url)).pathname}`;
					if (restrictedRoutes.has(route)) {
						const { limit, window } = restrictedRoutes.get(route) as RateLimitOptions;
						const ip = request.headers.get('x-forwarded-for')
							|| request.headers.get('x-real-ip')
							|| (server as Server<unknown>)?.requestIP(request)?.address
							|| '127.0.0.1';
						const key = `ratelimit:${route}:${ip}`;
						await rateLimitCheck(key, limit, window, set);
					}
				})
			})
		})

		.as('global');
};