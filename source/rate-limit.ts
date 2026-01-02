import { HttpError } from '@nowarajs/error';
import { MemoryStore } from '@nowarajs/kv-store/memory';
import type { KvStore } from '@nowarajs/kv-store/types';
import type { Server } from 'bun';
import { Elysia, type DefinitionBase, type HTTPHeaders, type MetadataBase, type SingletonBase, type StatusMap } from 'elysia';

import { RATE_LIMIT_ERROR_KEYS } from './enums/rate-limit-error-keys';
import type { RateLimitOptions } from './types/rate-limit-options';

/**
 * Rate limiting plugin for Elysia applications.
 *
 * Tracks request rates per IP and route, enforcing configurable limits with a fixed time window.
 * Adds `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers to responses.
 *
 * @param store - KV store for tracking limits. Defaults to in-memory.
 * @returns Elysia plugin with `rateLimit` macro
 *
 * @throws ({@link HttpError}) – `elysia.rate-limit.error.exceeded` (HTTP 429)
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
		.as('global') as unknown as Elysia<
		'rateLimit',
		SingletonBase,
		DefinitionBase,
		MetadataBase & { macro: Partial<{ readonly rateLimit: RateLimitOptions; }>; }
	>;
};