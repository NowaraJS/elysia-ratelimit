import { HttpError } from '@nowarajs/error';
import { MemoryStore } from '@nowarajs/kv-store';
import { Elysia } from 'elysia';

import { RATE_LIMIT_ERROR_KEYS } from './enums/rateLimitErrorKeys';
import type { RateLimitOptions } from './types/rateLimitOptions';

/**
 * The `rateLimitPlugin` provides rate limiting capabilities for Elysia applications,
 * protecting APIs from excessive use and potential abuse. It tracks request rates by client IP
 * and enforces configurable limits based on a sliding time window.
 *
 * ### Rate Limit Headers:
 * The plugin adds the following headers to all responses:
 * - `X-RateLimit-Limit`: The maximum number of requests allowed in the window
 * - `X-RateLimit-Remaining`: The number of requests remaining in the current window
 * - `X-RateLimit-Reset`: The time in seconds until the rate limit resets
 *
 * @param options - The configuration options for the rate limit plugin
 *
 * @returns An {@link Elysia} plugin that adds rate limiting functionality
 *
 * @example
 * Basic usage with default in-memory store
 * ```ts
 * import { rateLimit } from '@nowarajs/elysia-ratelimit';
 * import { Elysia } from 'elysia';
 *
 * const app = new Elysia()
 *   .use(rateLimit({
 *     limit: 100,           // 100 requests
 *     window: 60,           // per minute
 *   }))
 *   .get('/api/endpoint', () => ({ message: 'Hello World' }));
 *
 * app.listen(3000);
 * ```
 *
 * @example
 * Using Redis store for distributed rate limiting
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
 *   .use(rateLimit({
 *     store: redisStore,
 *     limit: 1000,          // 1000 requests
 *     window: 3600,         // per hour
 *   }))
 *   .get('/api/endpoint', () => ({ message: 'Hello World' }));
 *
 * app.listen(3000);
 * ```
 */
export const rateLimit = ({ store, limit, window }: RateLimitOptions) => {
	const storeInstance = store === ':memory:' || !store
		? new MemoryStore()
		: store;

	return new Elysia({
		name: 'rateLimit',
		seed: {
			store,
			limit,
			window
		}
	})
		.onRequest(async ({ set, request, server }) => {
			const ip = request.headers.get('x-forwarded-for')
				|| request.headers.get('x-real-ip')
				|| server?.requestIP(request)?.address // get IP from socket directly
				|| '127.0.0.1';

			const key = `ratelimit:${ip}`;

			const count = await storeInstance.get<number>(key);

			let newCount: number;
			if (count === null) {
				// First request - set counter to 1 with TTL
				await storeInstance.set(key, 1, window);
				newCount = 1;
			} else {
				// Increment existing counter
				newCount = await storeInstance.increment(key);
			}

			if (newCount > limit) {
				set.status = 429;
				throw new HttpError({
					message: RATE_LIMIT_ERROR_KEYS.RATE_LIMIT_EXCEEDED,
					httpStatusCode: 'TOO_MANY_REQUESTS',
					cause: {
						limit,
						window,
						remaining: 0,
						reset: await storeInstance.ttl(key)
					}
				});
			}

			set.headers = {
				'X-RateLimit-Limit': limit.toString(),
				'X-RateLimit-Remaining': Math.max(0, limit - newCount).toString(),
				'X-RateLimit-Reset': (await storeInstance.ttl(key)).toString()
			};
		})
		.as('global');
};