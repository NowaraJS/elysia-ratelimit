import type { Redis } from 'ioredis';

import type { RateLimitStore } from '#/types/rateLimitStore';

/**
 * Redis store wrapper that implements the common RateLimitStore interface.
 */
export class RedisStoreWrapper implements RateLimitStore {
	private readonly _redis: Redis;

	public constructor(redis: Redis) {
		this._redis = redis;
	}

	public async get(key: string): Promise<string | null> {
		return this._redis.get(key);
	}

	public async setex(key: string, seconds: number, value: string): Promise<void> {
		await this._redis.setex(key, seconds, value);
	}

	public async incr(key: string): Promise<number> {
		return this._redis.incr(key);
	}

	public async ttl(key: string): Promise<number> {
		return this._redis.ttl(key);
	}
}
