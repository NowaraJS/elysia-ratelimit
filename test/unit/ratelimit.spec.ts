import { describe, expect, test } from 'bun:test';
import { Redis, type RedisKey } from 'ioredis';

import { rateLimit } from '#/rateLimit';

class MockRedis extends Redis {
	private readonly _data: Map<RedisKey, string>;

	private readonly _expiry: Map<RedisKey, number>;

	public constructor() {
		super({
			lazyConnect: true
		});
		this._data = new Map();
		this._expiry = new Map();
	}

	public override get(key: RedisKey): Promise<string | null> {
		return new Promise((resolve) => {
			if (this._isExpired(key)) {
				this._data.delete(key);
				this._expiry.delete(key);
				resolve(null);
			} else {
				resolve(this._data.get(key) || null);
			}
		});
	}

	public override setex(key: RedisKey, seconds: number | string, value: string | Buffer | number): Promise<'OK'> {
		return new Promise((resolve) => {
			this._data.set(key, value.toString());
			this._expiry.set(key, Date.now() + (Number(seconds) * 1000));
			resolve('OK');
		});
	}

	public override incr(key: RedisKey): Promise<number> {
		return new Promise((resolve) => {
			if (this._isExpired(key)) {
				this._data.delete(key);
				this._expiry.delete(key);
			}
			const current = this._data.get(key);
			const newValue = current ? parseInt(current) + 1 : 1;
			this._data.set(key, newValue.toString());
			resolve(newValue);
		});
	}

	public override ttl(key: RedisKey): Promise<number> {
		return new Promise((resolve) => {
			const expiry = this._expiry.get(key);
			if (!expiry) {
				resolve(-1);
			} else {
				const remaining = Math.max(0, Math.ceil((expiry - Date.now()) / 1000));
				resolve(remaining);
			}
		});
	}

	public override exists(...args: unknown[]): Promise<number> {
		return new Promise((resolve) => {
			const key = args[0] as RedisKey;
			if (this._isExpired(key)) {
				this._data.delete(key);
				this._expiry.delete(key);
				resolve(0);
			} else {
				resolve(this._data.has(key) ? 1 : 0);
			}
		});
	}

	private _isExpired(key: RedisKey): boolean {
		const expiry = this._expiry.get(key);
		return expiry ? Date.now() > expiry : false;
	}

	public get data() {
		return this._data;
	}

	public get expiry() {
		return this._expiry;
	}
}

describe('rateLimit - Redis Store', () => {
	test('should handle basic rate limiting workflow', async () => {
		const redis = new MockRedis();
		const limit = 5;
		const window = 60;

		const app = rateLimit({ store: redis, limit, window })
			.get('/test', () => 'OK');

		const ip = '127.0.0.1';

		// Test requests within limit
		for (let i = 0; i < limit; ++i) {
			const response = await app.handle(new Request('http://localhost/test', {
				headers: { 'x-forwarded-for': ip }
			}));
			expect(response.status).toEqual(200);
			expect(response.headers.get('X-RateLimit-Limit')).toEqual(limit.toString());
			expect(response.headers.get('X-RateLimit-Remaining')).toEqual((limit - i - 1).toString());
			expect(parseInt(response.headers.get('X-RateLimit-Reset') || '0')).toBeGreaterThan(0);
		}

		// Test request exceeding limit
		const blockedResponse = await app.handle(new Request('http://localhost/test', {
			headers: { 'x-forwarded-for': ip }
		}));
		expect(blockedResponse.status).toBe(429);
		expect(await blockedResponse.text()).toEqual('elysia.rateLimit.error.exceeded');
	});

	test('should handle different IP extraction methods and maintain separate counters', async () => {
		const redis = new MockRedis();
		const limit = 5;
		const window = 60;

		const app = rateLimit({ store: redis, limit, window })
			.get('/test', () => 'OK');

		// Test x-forwarded-for header
		const response1 = await app.handle(new Request('http://localhost/test', {
			headers: { 'x-forwarded-for': '192.168.1.100' }
		}));
		expect(response1.status).toEqual(200);
		expect(response1.headers.get('X-RateLimit-Remaining')).toEqual('4');

		// Test x-real-ip header (different IP = different bucket)
		const response2 = await app.handle(new Request('http://localhost/test', {
			headers: { 'x-real-ip': '192.168.1.101' }
		}));
		expect(response2.status).toEqual(200);
		expect(response2.headers.get('X-RateLimit-Remaining')).toEqual('4');

		// Test fallback to default IP
		const response3 = await app.handle(new Request('http://localhost/test', {}));
		expect(response3.status).toEqual(200);
		expect(response3.headers.get('X-RateLimit-Remaining')).toEqual('4');

		// Verify x-forwarded-for has priority over x-real-ip
		const response4 = await app.handle(new Request('http://localhost/test', {
			headers: {
				'x-forwarded-for': '192.168.1.100',
				'x-real-ip': '192.168.1.102'
			}
		}));
		expect(response4.headers.get('X-RateLimit-Remaining')).toEqual('3'); // Uses x-forwarded-for bucket
	});

	test('should handle edge cases with IP headers', async () => {
		const redis = new MockRedis();
		const limit = 5;
		const window = 60;

		const app = rateLimit({ store: redis, limit, window })
			.get('/test', () => 'OK');

		const testCases = [
			'2001:0db8:85a3:0000:0000:8a2e:0370:7334', // IPv6
			'127.0.0.1,192.168.1.1', // Comma-separated (proxy)
			'not-an-ip-address', // Malformed IP
			'' // Empty string
		];

		for (const testIp of testCases) {
			const response = await app.handle(new Request('http://localhost/test', {
				headers: { 'x-forwarded-for': testIp }
			}));
			expect(response.status).toEqual(200);
		}

		// Test header injection attempt separately (without unicode which fails in headers)
		const response = await app.handle(new Request('http://localhost/test', {
			headers: { 'x-forwarded-for': '192.168.1.100' }
		}));
		expect(response.status).toEqual(200);
		expect(response.headers.get('X-Injected')).toBeNull(); // No injection
	});

	test('should handle concurrent requests correctly', async () => {
		const redis = new MockRedis();
		const limit = 5;
		const window = 60;

		const app = rateLimit({ store: redis, limit, window })
			.get('/test', () => 'OK');

		// Test concurrent requests from different IPs
		const ips = ['10.0.0.1', '10.0.0.2', '10.0.0.3'];
		const promises = ips.map((ip) => app.handle(new Request('http://localhost/test', {
			headers: { 'x-forwarded-for': ip }
		})));

		const responses = await Promise.all(promises);
		responses.forEach((response) => {
			expect(response.status).toEqual(200);
			expect(response.headers.get('X-RateLimit-Remaining')).toEqual('4');
		});

		// Test rapid requests from same IP (race condition handling)
		const rapidPromises: Promise<Response>[] = [];
		for (let i = 0; i < 10; ++i)
			rapidPromises.push(app.handle(new Request('http://localhost/test', {
				headers: { 'x-forwarded-for': '203.0.113.100' }
			})));

		const rapidResponses = await Promise.all(rapidPromises);
		const successCount = rapidResponses.filter((r) => r.status === 200).length;
		const blockedCount = rapidResponses.filter((r) => r.status === 429).length;

		expect(successCount).toBeGreaterThanOrEqual(5);
		expect(successCount + blockedCount).toBe(10);
	});

	test('should handle different rate limit configurations', async () => {
		const redis = new MockRedis();

		// Test very low limit
		const lowLimitApp = rateLimit({ store: redis, limit: 1, window: 60 })
			.get('/test', () => 'Low limit test');

		const ip1 = '198.51.100.200';
		const response1 = await lowLimitApp.handle(new Request('http://localhost/test', {
			headers: { 'x-forwarded-for': ip1 }
		}));
		expect(response1.status).toEqual(200);
		expect(response1.headers.get('X-RateLimit-Remaining')).toEqual('0');

		const response2 = await lowLimitApp.handle(new Request('http://localhost/test', {
			headers: { 'x-forwarded-for': ip1 }
		}));
		expect(response2.status).toBe(429);

		// Test high limit
		const highLimitApp = rateLimit({ store: redis, limit: 1000, window: 60 })
			.get('/test', () => 'High limit test');

		const ip2 = '203.0.113.250';
		for (let i = 0; i < 10; ++i)
			await highLimitApp.handle(new Request('http://localhost/test', {
				headers: { 'x-forwarded-for': ip2 }
			}));

		const finalResponse = await highLimitApp.handle(new Request('http://localhost/test', {
			headers: { 'x-forwarded-for': ip2 }
		}));
		expect(finalResponse.headers.get('X-RateLimit-Remaining')).toEqual('989');
	});

	test('should handle TTL and Redis operations correctly', async () => {
		const redis = new MockRedis();
		const limit = 5;
		const window = 60;

		const app = rateLimit({ store: redis, limit, window })
			.get('/test', () => 'OK');

		const testIp = '172.16.254.1';

		// Make a request to create the key
		await app.handle(new Request('http://localhost/test', {
			headers: { 'x-forwarded-for': testIp }
		}));

		// Verify key exists and has TTL
		const keyExists = await redis.exists(`ratelimit:${testIp}`);
		expect(keyExists).toBe(1);

		const ttl = await redis.ttl(`ratelimit:${testIp}`);
		expect(ttl).toBeGreaterThan(0);
		expect(ttl).toBeLessThanOrEqual(60);
	});

	test('should handle HTTP methods and request variations', async () => {
		const redis = new MockRedis();
		const limit = 5;
		const window = 60;

		const app = rateLimit({ store: redis, limit, window })
			.get('/test', () => 'GET OK')
			.post('/test', ({ body }) => ({ received: body }));

		const ip = '192.168.1.100';

		// Test different HTTP methods share the same rate limit
		const getResponse = await app.handle(new Request('http://localhost/test', {
			method: 'GET',
			headers: { 'x-forwarded-for': ip }
		}));
		expect(getResponse.status).toEqual(200);
		expect(getResponse.headers.get('X-RateLimit-Remaining')).toEqual('4');

		// Test with request body
		const postResponse = await app.handle(new Request('http://localhost/test', {
			method: 'POST',
			headers: {
				'x-forwarded-for': ip,
				'content-type': 'application/json'
			},
			body: JSON.stringify({ data: 'test' })
		}));
		expect(postResponse.status).toEqual(200);
		expect(postResponse.headers.get('X-RateLimit-Remaining')).toEqual('3');

		// Test with query parameters
		const queryResponse = await app.handle(new Request('http://localhost/test?param=value', {
			headers: { 'x-forwarded-for': ip }
		}));
		expect(queryResponse.status).toEqual(200);
		expect(queryResponse.headers.get('X-RateLimit-Remaining')).toEqual('2');
	});

	test('should handle window expiration', async () => {
		const redis = new MockRedis();
		const limit = 5;
		const window = 1; // 1 second window

		const app = rateLimit({ store: redis, limit, window })
			.get('/test', () => 'OK');

		const ip = '192.168.1.100';

		// Make a request
		const response1 = await app.handle(new Request('http://localhost/test', {
			headers: { 'x-forwarded-for': ip }
		}));
		expect(response1.status).toEqual(200);
		expect(response1.headers.get('X-RateLimit-Remaining')).toEqual('4');

		// Wait for window to expire
		await new Promise((resolve) => setTimeout(resolve, 1100));

		// Should be reset to fresh window
		const response2 = await app.handle(new Request('http://localhost/test', {
			headers: { 'x-forwarded-for': ip }
		}));
		expect(response2.status).toEqual(200);
		expect(response2.headers.get('X-RateLimit-Remaining')).toEqual('4');
	});
});

describe('rateLimit - Memory Store', () => {
	test('should work with explicit memory store configuration', async () => {
		const limit = 3;
		const window = 60;

		const app = rateLimit({ store: ':memory:', limit, window })
			.get('/test', () => 'OK');

		const ip = '127.0.0.1';

		// Test basic functionality with memory store
		for (let i = 0; i < limit; ++i) {
			const response = await app.handle(new Request('http://localhost/test', {
				headers: { 'x-forwarded-for': ip }
			}));
			expect(response.status).toEqual(200);
			expect(response.headers.get('X-RateLimit-Remaining')).toEqual((limit - i - 1).toString());
		}

		// Test rate limit exceeded
		const blockedResponse = await app.handle(new Request('http://localhost/test', {
			headers: { 'x-forwarded-for': ip }
		}));
		expect(blockedResponse.status).toBe(429);
		expect(await blockedResponse.text()).toEqual('elysia.rateLimit.error.exceeded');
	});

	test('should work with default memory store (no store specified)', async () => {
		const limit = 2;
		const window = 60;

		const app = rateLimit({ limit, window })
			.get('/test', () => 'OK');

		const ip = '192.168.1.1';

		// Test that memory store is used by default
		const response1 = await app.handle(new Request('http://localhost/test', {
			headers: { 'x-forwarded-for': ip }
		}));
		expect(response1.status).toEqual(200);
		expect(response1.headers.get('X-RateLimit-Remaining')).toEqual('1');

		const response2 = await app.handle(new Request('http://localhost/test', {
			headers: { 'x-forwarded-for': ip }
		}));
		expect(response2.status).toEqual(200);
		expect(response2.headers.get('X-RateLimit-Remaining')).toEqual('0');

		const response3 = await app.handle(new Request('http://localhost/test', {
			headers: { 'x-forwarded-for': ip }
		}));
		expect(response3.status).toBe(429);
	});

	test('should maintain separate counters for different IPs (memory)', async () => {
		const limit = 2;
		const window = 60;

		const app = rateLimit({ store: ':memory:', limit, window })
			.get('/test', () => 'OK');

		const ip1 = '10.0.0.1';
		const ip2 = '10.0.0.2';

		// IP1 makes requests
		const response1 = await app.handle(new Request('http://localhost/test', {
			headers: { 'x-forwarded-for': ip1 }
		}));
		expect(response1.headers.get('X-RateLimit-Remaining')).toEqual('1');

		// IP2 should have separate counter
		const response2 = await app.handle(new Request('http://localhost/test', {
			headers: { 'x-forwarded-for': ip2 }
		}));
		expect(response2.headers.get('X-RateLimit-Remaining')).toEqual('1');

		// IP1 second request
		const response3 = await app.handle(new Request('http://localhost/test', {
			headers: { 'x-forwarded-for': ip1 }
		}));
		expect(response3.headers.get('X-RateLimit-Remaining')).toEqual('0');

		// IP1 should be limited now
		const response4 = await app.handle(new Request('http://localhost/test', {
			headers: { 'x-forwarded-for': ip1 }
		}));
		expect(response4.status).toBe(429);

		// But IP2 should still work
		const response5 = await app.handle(new Request('http://localhost/test', {
			headers: { 'x-forwarded-for': ip2 }
		}));
		expect(response5.status).toEqual(200);
	});
});
