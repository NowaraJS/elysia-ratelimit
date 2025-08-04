import { describe, expect, test } from 'bun:test';

import { MemoryStore } from '#/stores/memoryStore';

describe('MemoryStore', () => {
	describe('Basic Operations', () => {
		test('should create empty store', () => {
			const store = new MemoryStore();
			expect(store.get('nonexistent')).toBeNull();
		});

		test('should set and get values', () => {
			const store = new MemoryStore();
			store.setex('key1', 60, 'value1');
			expect(store.get('key1')).toBe('value1');
		});

		test('should increment values correctly', () => {
			const store = new MemoryStore();
			store.setex('counter', 60, '5');

			const result = store.incr('counter');
			expect(result).toBe(6);
			expect(store.get('counter')).toBe('6');
		});

		test('should handle increment on non-existent key', () => {
			const store = new MemoryStore();
			const result = store.incr('newcounter');
			expect(result).toBe(1);
			expect(store.get('newcounter')).toBe('1');
		});
	});

	describe('TTL Management', () => {
		test('should set and get TTL correctly', () => {
			const store = new MemoryStore();
			store.setex('key1', 120, 'value1');

			const ttl = store.ttl('key1');
			expect(ttl).toBeGreaterThan(110);
			expect(ttl).toBeLessThanOrEqual(120);
		});

		test('should return -1 for non-existent key TTL', () => {
			const store = new MemoryStore();
			expect(store.ttl('nonexistent')).toBe(-1);
		});

		test('should preserve TTL on increment', () => {
			const store = new MemoryStore();
			store.setex('counter', 60, '1');

			const originalTtl = store.ttl('counter');
			store.incr('counter');
			const newTtl = store.ttl('counter');

			// TTL should remain approximately the same after increment
			expect(Math.abs(newTtl - originalTtl)).toBeLessThan(5);
		});
	});

	describe('Expiration & Cleanup', () => {
		test('should expire keys after TTL', async () => {
			const store = new MemoryStore();
			store.setex('shortlived', 1, 'value'); // 1 second TTL

			expect(store.get('shortlived')).toBe('value');

			// Wait for expiration
			await new Promise((resolve) => setTimeout(resolve, 1100));

			expect(store.get('shortlived')).toBeNull();
		});

		test('should handle expired key increment gracefully', async () => {
			const store = new MemoryStore();
			store.setex('expiring', 1, '5');

			// Wait for expiration
			await new Promise((resolve) => setTimeout(resolve, 1100));

			// Should create new entry with value 1
			const result = store.incr('expiring');
			expect(result).toBe(1);
		});

		test('should trigger automatic cleanup', async () => {
			const store = new MemoryStore();
			
			// Create multiple short-lived entries that will expire
			for (let i = 0; i < 5; i++)
				store.setex(`temp${i}`, 1, `value${i}`);
			
			// Create some entries that won't expire
			for (let i = 0; i < 3; i++)
				store.setex(`persist${i}`, 60, `value${i}`);
			
			// Verify entries exist
			expect(store.get('temp0')).toBe('value0');
			expect(store.get('temp4')).toBe('value4');
			expect(store.get('persist0')).toBe('value0');
			
			// Wait for expiration and multiple cleanup cycles to ensure cleanup runs
			await new Promise((resolve) => setTimeout(resolve, 2500));
			
			// Expired entries should be cleaned up automatically
			expect(store.get('temp0')).toBeNull();
			expect(store.get('temp4')).toBeNull();
			
			// Non-expired entries should still exist
			expect(store.get('persist0')).toBe('value0');
			expect(store.get('persist2')).toBe('value2');
			
			// Cleanup
			store.destroy();
		});

		test('should execute automatic cleanup timer callback', async () => {
			// Use a very short cleanup interval for testing (100ms)
			const store = new MemoryStore(100);
			
			// Create entries that will expire quickly
			for (let i = 0; i < 3; i++)
				store.setex(`test${i}`, 1, `value${i}`);
			
			// Verify entries exist initially
			expect(store.get('test0')).toBe('value0');
			expect(store.get('test1')).toBe('value1');
			
			// Wait for entries to expire
			await new Promise((resolve) => setTimeout(resolve, 1100));
			
			// Wait for cleanup timer to run (at least one cleanup cycle)
			await new Promise((resolve) => setTimeout(resolve, 150));
			
			// Expired entries should be automatically cleaned up by timer
			expect(store.get('test0')).toBeNull();
			expect(store.get('test1')).toBeNull();
			expect(store.get('test2')).toBeNull();
			
			// Cleanup
			store.destroy();
		});

		test('should destroy store and cleanup resources', () => {
			const store = new MemoryStore();

			// Add some data
			store.setex('key1', 60, 'value1');
			store.setex('key2', 60, 'value2');

			expect(store.get('key1')).toBe('value1');
			expect(store.get('key2')).toBe('value2');

			// Destroy the store
			store.destroy();

			// All data should be cleared
			expect(store.get('key1')).toBeNull();
			expect(store.get('key2')).toBeNull();
		});
	});

	describe('Edge Cases', () => {
		test('should handle empty string values', () => {
			const store = new MemoryStore();
			store.setex('empty', 60, '');
			expect(store.get('empty')).toBe('');
		});

		test('should handle zero and negative TTL', () => {
			const store = new MemoryStore();

			// Zero TTL should not store
			store.setex('zero', 0, 'value');
			expect(store.get('zero')).toBeNull();

			// Negative TTL should not store
			store.setex('negative', -1, 'value');
			expect(store.get('negative')).toBeNull();
		});

		test('should handle very large numbers in increment', () => {
			const store = new MemoryStore();
			store.setex('large', 60, '999999999');

			const result = store.incr('large');
			expect(result).toBe(1000000000);
		});

		test('should handle invalid number strings in increment', () => {
			const store = new MemoryStore();
			store.setex('invalid', 60, 'notanumber');

			// Should treat as 0 and increment to 1
			const result = store.incr('invalid');
			expect(result).toBe(1);
		});
	});

	describe('Multiple Keys & Performance', () => {
		test('should handle multiple keys independently', () => {
			const store = new MemoryStore();

			store.setex('key1', 60, 'value1');
			store.setex('key2', 120, 'value2');
			store.setex('counter1', 60, '5');
			store.setex('counter2', 60, '10');

			expect(store.get('key1')).toBe('value1');
			expect(store.get('key2')).toBe('value2');

			expect(store.incr('counter1')).toBe(6);
			expect(store.incr('counter2')).toBe(11);

			// Original values should be unchanged
			expect(store.get('key1')).toBe('value1');
			expect(store.get('key2')).toBe('value2');
		});

		test('should handle many operations efficiently', () => {
			const store = new MemoryStore();
			const start = performance.now();

			// Perform many operations
			for (let i = 0; i < 1000; i++) {
				store.setex(`key${i}`, 60, `value${i}`);
				store.get(`key${i}`);
				store.incr(`counter${i}`);
			}

			const end = performance.now();
			const duration = end - start;

			// Should complete 3000 operations in reasonable time (< 100ms)
			expect(duration).toBeLessThan(100);

			// Cleanup
			store.destroy();
		});
	});
});
