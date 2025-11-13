import { describe, expect, test } from 'bun:test';
import { Elysia } from 'elysia';

import { rateLimit } from '#/rate-limit';
import { RATE_LIMIT_ERROR_KEYS } from '#/enums/rate-limit-error-keys';

describe.concurrent('rateLimit', () => {
	test('should return correct rate limit headers for valid requests', async () => {
		const ip = '127.0.0.1';
		const limit = 3;
		const app = new Elysia()
			.use(rateLimit())
			.get('/test', () => 'OK', {
				rateLimit: {
					limit,
					window: 60
				}
			});

		for (let i = 0; i < limit; ++i) {
			const response = await app.handle(new Request('http://localhost/test', {
				headers: { 'x-forwarded-for': ip }
			}));
			expect(response.status).toEqual(200);
			expect(response.headers.get('X-RateLimit-Limit')).toEqual(limit.toString());
			expect(response.headers.get('X-RateLimit-Remaining')).toEqual((limit - i - 1).toString());
			expect(parseInt(response.headers.get('X-RateLimit-Reset') || '0')).toBeGreaterThan(0);
		}
	});

	test('should return 429 when rate limit is exceeded', async () => {
		const ip = '192.168.1.1';
		const limit = 2;
		const app = new Elysia()
			.use(rateLimit())
			.get('/test', () => 'OK', {
				rateLimit: {
					limit,
					window: 60
				}
			});

		// Use up the limit
		for (let i = 0; i < limit; ++i)
			await app.handle(new Request('http://localhost/test', {
				headers: { 'x-forwarded-for': ip }
			}));

		// Next request should be blocked
		const blockedResponse = await app.handle(new Request('http://localhost/test', {
			headers: { 'x-forwarded-for': ip }
		}));
		expect(blockedResponse.status).toBe(429);
		expect(await blockedResponse.text()).toEqual(RATE_LIMIT_ERROR_KEYS.RATE_LIMIT_EXCEEDED);

		// Verify rate limit headers are present even on 429
		expect(blockedResponse.headers.get('X-RateLimit-Limit')).toEqual(limit.toString());
		expect(blockedResponse.headers.get('X-RateLimit-Remaining')).toEqual('0');
		expect(parseInt(blockedResponse.headers.get('X-RateLimit-Reset') || '0')).toBeGreaterThan(0);
	});

	test('should handle multiple IPs separately', async () => {
		const limit = 2;
		const app = new Elysia()
			.use(rateLimit())
			.get('/test', () => 'OK', {
				rateLimit: {
					limit,
					window: 60
				}
			});

		const ips = [
			'127.0.0.1',
			'192.168.1.1',
			'10.0.0.1'
		];

		for (const ip of ips)
			for (let i = 0; i < limit; ++i) {
				const response = await app.handle(new Request('http://localhost/test', {
					headers: { 'x-forwarded-for': ip }
				}));
				expect(response.headers.get('X-RateLimit-Remaining')).toEqual((limit - i - 1).toString());
				expect(response.status).toEqual(200);
			}
	});

	test('should reset rate limit after window expires', async () => {
		const ip = '127.0.0.1';
		const limit = 2;
		const window = 2; // 2 seconds
		const app = new Elysia()
			.use(rateLimit())
			.get('/test', () => 'OK', {
				rateLimit: {
					limit,
					window
				}
			});

		// Use up the limit
		for (let i = 0; i < limit; ++i)
			await app.handle(new Request('http://localhost/test', {
				headers: { 'x-forwarded-for': ip }
			}));

		// Next request should be blocked
		const blockedResponse = await app.handle(new Request('http://localhost/test', {
			headers: { 'x-forwarded-for': ip }
		}));
		expect(blockedResponse.status).toBe(429);

		// Wait for window to expire
		Bun.sleepSync((window * 1000) + 100);

		// Request should be allowed again
		const response = await app.handle(new Request('http://localhost/test', {
			headers: { 'x-forwarded-for': ip }
		}));
		expect(response.status).toBe(200);
		expect(response.headers.get('X-RateLimit-Remaining')).toEqual((limit - 1).toString());
	});

	test('should handle different rate limits for different routes', async () => {
		const ip = '127.0.0.1';
		const app = new Elysia()
			.use(rateLimit())
			.get('/route1', () => 'Route 1', {
				rateLimit: {
					limit: 2,
					window: 60
				}
			})
			.get('/route2', () => 'Route 2', {
				rateLimit: {
					limit: 3,
					window: 60
				}
			});

		// Use up limit for route1
		for (let i = 0; i < 2; ++i)
			await app.handle(new Request('http://localhost/route1', {
				headers: { 'x-forwarded-for': ip }
			}));

		// Next request to route1 should be blocked
		const blockedResponse1 = await app.handle(new Request('http://localhost/route1', {
			headers: { 'x-forwarded-for': ip }
		}));
		expect(blockedResponse1.status).toBe(429);

		// Verify headers are present with correct route1 limit on 429
		expect(blockedResponse1.headers.get('X-RateLimit-Limit')).toEqual('2');
		expect(blockedResponse1.headers.get('X-RateLimit-Remaining')).toEqual('0');
		expect(parseInt(blockedResponse1.headers.get('X-RateLimit-Reset') || '0')).toBeGreaterThan(0);

		// Requests to route2 should still be allowed
		for (let i = 0; i < 3; ++i) {
			const response = await app.handle(new Request('http://localhost/route2', {
				headers: { 'x-forwarded-for': ip }
			}));
			expect(response.status).toBe(200);
			expect(response.headers.get('X-RateLimit-Remaining')).toEqual((3 - i - 1).toString());
		}
	});

	test('shoudl handle global rate limit ', async () => {
		const ip = '127.0.0.2';
		const app = new Elysia()
			.use(rateLimit())
			.guard({
				rateLimit: {
					limit: 5,
					window: 60
				}
			})
			.get('/test', () => 'OK');
		for (let i = 0; i < 5; ++i) {
			const response = await app.handle(new Request('http://localhost/test', {
				headers: { 'x-forwarded-for': ip }
			}));
			expect(response.status).toBe(200);
			expect(response.headers.get('X-RateLimit-Remaining')).toEqual((5 - i - 1).toString());
		}
		const blockedResponse = await app.handle(new Request('http://localhost/test', {
			headers: { 'x-forwarded-for': ip }
		}));
		expect(blockedResponse.status).toBe(429);

		// Verify rate limit headers are present on global rate limit 429
		expect(blockedResponse.headers.get('X-RateLimit-Limit')).toEqual('5');
		expect(blockedResponse.headers.get('X-RateLimit-Remaining')).toEqual('0');
		expect(parseInt(blockedResponse.headers.get('X-RateLimit-Reset') || '0')).toBeGreaterThan(0);
	});

	test('should specific route rate limit override global rate limit', async () => {
		const ip = '127.0.0.1';
		const app = new Elysia()
			.use(rateLimit())
			.guard({
				rateLimit: {
					limit: 5,
					window: 60
				}
			})
			.get('/test', () => 'OK', {
				rateLimit: {
					limit: 2,
					window: 60
				}
			});

		for (let i = 0; i < 2; ++i) {
			const response = await app.handle(new Request('http://localhost/test', {
				headers: { 'x-forwarded-for': ip }
			}));
			expect(response.status).toBe(200);
			expect(response.headers.get('X-RateLimit-Remaining')).toEqual((2 - i - 1).toString());
		}

		const blockedResponse = await app.handle(new Request('http://localhost/test', {
			headers: { 'x-forwarded-for': ip }
		}));
		expect(blockedResponse.status).toBe(429);

		// Verify route override limit is enforced with headers on 429
		expect(blockedResponse.headers.get('X-RateLimit-Limit')).toEqual('2');
		expect(blockedResponse.headers.get('X-RateLimit-Remaining')).toEqual('0');
		expect(parseInt(blockedResponse.headers.get('X-RateLimit-Reset') || '0')).toBeGreaterThan(0);
	});
});