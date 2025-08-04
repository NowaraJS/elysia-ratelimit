import type { MemoryStoreEntry } from '#/types/memoryStoreEntry';
import type { RateLimitStore } from '#/types/rateLimitStore';

export class MemoryStore implements RateLimitStore {
	/**
	 * Internal storage map.
	 */
	private readonly _store = new Map<string, MemoryStoreEntry>();

	/**
	 * Cleanup interval (5 minutes by default).
	 */
	private readonly _cleanupInterval: number;

	/**
	 * Timer for cleanup operations.
	 */
	private _cleanupTimer: Timer | null = null;

	/**
	 * Creates instance and starts cleanup process.
	 */
	public constructor(cleanupIntervalMs?: number) {
		this._cleanupInterval = cleanupIntervalMs ?? 300000;
		this._startCleanup();
	}

	/**
	 * Get current count for a key.
	 */
	public get(key: string): string | null {
		const entry = this._store.get(key);

		if (!entry)
			return null;

		const now = Date.now();
		if (now > entry.expiresAt) {
			this._store.delete(key);
			return null;
		}

		return entry.value;
	}

	/**
	 * Set key with expiration time.
	 */
	public setex(key: string, seconds: number, value: string): void {
		if (seconds <= 0)
			return; // Don't store if TTL is 0 or negative

		const expiresAt = Date.now() + (seconds * 1000);
		this._store.set(key, {
			value,
			expiresAt
		});
	}

	/**
	 * Increment key value and return new count.
	 */
	public incr(key: string): number {
		const now = Date.now();
		const entry = this._store.get(key);

		if (!entry || now > entry.expiresAt) {
			if (entry)
				this._store.delete(key);

			this._store.set(key, {
				value: '1',
				expiresAt: now + (3600 * 1000) // Default 1 hour expiry
			});
			return 1;
		}

		const currentValue = parseInt(entry.value) || 0;
		const newValue = currentValue + 1;
		this._store.set(key, {
			value: newValue.toString(),
			expiresAt: entry.expiresAt
		});

		return newValue;
	}

	/**
	 * Get time to live for key in seconds.
	 */
	public ttl(key: string): number {
		const entry = this._store.get(key);

		if (!entry)
			return -1;

		const now = Date.now();
		if (now > entry.expiresAt) {
			this._store.delete(key);
			return -1;
		}

		return Math.ceil((entry.expiresAt - now) / 1000);
	}

	/**
	 * Start cleanup process.
	 */
	private _startCleanup(): void {
		this._cleanupTimer = setInterval(() => {
			this._cleanup();
		}, this._cleanupInterval);
	}

	/**
	 * Clean up expired entries.
	 */
	private _cleanup(): void {
		const now = Date.now();
		for (const [key, entry] of this._store.entries())
			if (now > entry.expiresAt)
				this._store.delete(key);
	}

	/**
	 * Stop cleanup and clear data.
	 */
	public destroy(): void {
		if (this._cleanupTimer) {
			clearInterval(this._cleanupTimer);
			this._cleanupTimer = null;
		}
		this._store.clear();
	}
}
