import { describe, expect, test } from 'bun:test';

import { RateLimitError } from '#/error/rateLimitError';

describe('RateLimitError', () => {
	describe('constructor', () => {
		test('should create a new RateLimitError instance with specific properties when valid options are provided', () => {
			const rateLimitError = new RateLimitError<{ details: string }>({
				message: 'error.rate.limit',
				httpStatusCode: 429,
				cause: { details: 'Rate limit exceeded' }
			});

			expect(rateLimitError).toBeInstanceOf(RateLimitError);
			expect(rateLimitError).toBeInstanceOf(Error);
			expect(rateLimitError.uuid).toBeTypeOf('string');
			expect(rateLimitError.uuid).toHaveLength(36); // UUID v7 length
			expect(rateLimitError.date).toBeInstanceOf(Date);
			expect(rateLimitError.httpStatusCode).toBe(429);
			expect(rateLimitError.cause).toEqual({ details: 'Rate limit exceeded' });
			expect(rateLimitError.message).toBe('error.rate.limit');
			expect(rateLimitError.name).toBe('RateLimitError');
			expect(rateLimitError.stack).toBeTypeOf('string');
		});

		test('should create a new RateLimitError instance with default properties when no options are provided', () => {
			const rateLimitError = new RateLimitError();

			expect(rateLimitError).toBeInstanceOf(RateLimitError);
			expect(rateLimitError).toBeInstanceOf(Error);
			expect(rateLimitError.uuid).toBeTypeOf('string');
			expect(rateLimitError.uuid).toHaveLength(36); // UUID v7 length
			expect(rateLimitError.date).toBeInstanceOf(Date);
			expect(rateLimitError.httpStatusCode).toBe(500);
			expect(rateLimitError.cause).toBeUndefined();
			expect(rateLimitError.message).toBe('');
			expect(rateLimitError.name).toBe('RateLimitError');
			expect(rateLimitError.stack).toBeTypeOf('string');
		});

		test('should create a new RateLimitError instance with partial options', () => {
			const rateLimitError = new RateLimitError({
				message: 'Rate limit exceeded',
				httpStatusCode: 403
			});

			expect(rateLimitError).toBeInstanceOf(RateLimitError);
			expect(rateLimitError.message).toBe('Rate limit exceeded');
			expect(rateLimitError.httpStatusCode).toBe(403);
			expect(rateLimitError.cause).toBeUndefined();
		});

		test('should generate unique UUIDs for different instances', () => {
			const error1 = new RateLimitError({ message: 'Error 1' });
			const error2 = new RateLimitError({ message: 'Error 2' });

			expect(error1.uuid).not.toBe(error2.uuid);
		});

		test('should generate different dates for instances created at different times', async () => {
			const error1 = new RateLimitError({ message: 'Error 1' });

			// Wait a small amount of time to ensure different timestamps
			await new Promise((resolve) => setTimeout(resolve, 1));

			const error2 = new RateLimitError({ message: 'Error 2' });

			expect(error1.date.getTime()).not.toBe(error2.date.getTime());
		});

		test('should preserve the original Error properties', () => {
			const originalError = new Error('Original error');
			const rateLimitError = new RateLimitError({
				message: 'Wrapped error',
				cause: originalError
			});

			expect(rateLimitError.cause).toBe(originalError);
			expect(rateLimitError.stack).toContain('RateLimitError');
		});
	});

	describe('getters', () => {
		test('should return correct values from getters', () => {
			const rateLimitError = new RateLimitError({
				message: 'test.key',

				httpStatusCode: 400,
				cause: 'test cause'
			});

			expect(rateLimitError.uuid).toBeTypeOf('string');
			expect(rateLimitError.date).toBeInstanceOf(Date);
			expect(rateLimitError.httpStatusCode).toBe(400);
		});

		test('should return immutable values', () => {
			const rateLimitError = new RateLimitError({
				message: 'test.key',
				httpStatusCode: 400
			});

			const originalUuid = rateLimitError.uuid;
			const originalDate = rateLimitError.date;
			const originalHttpStatusCode = rateLimitError.httpStatusCode;

			// Verify that getters return the same values
			expect(rateLimitError.uuid).toBe(originalUuid);
			expect(rateLimitError.date).toBe(originalDate);
			expect(rateLimitError.httpStatusCode).toBe(originalHttpStatusCode);
		});
	});
});
