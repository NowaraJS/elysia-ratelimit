import { describe, expect, test } from 'bun:test';

import { PkgError } from '#/error/pkgError';

describe('PkgError', () => {
	describe('constructor', () => {
		test('should create a new PkgError instance with specific properties when valid options are provided', () => {
			const pkgError = new PkgError<{ eg: string }>({
				message: 'An example error',
				key: 'error.package.example',
				httpStatusCode: 123,
				cause: { eg: 'example' }
			});
			expect(pkgError).toBeInstanceOf(PkgError);
			expect(pkgError).toHaveProperty('uuid');
			expect(pkgError).toHaveProperty('date');
			expect(pkgError).toHaveProperty('key', 'error.package.example');
			expect(pkgError).toHaveProperty('httpStatusCode', 123);
			expect(pkgError).toHaveProperty('cause', { eg: 'example' });
			expect(pkgError).toHaveProperty('message', 'An example error');
			expect(pkgError).toHaveProperty('name', 'PkgError');
			expect(pkgError).toHaveProperty('stack');
		});

		test('should create a new PkgError instance with default properties when no options are provided', () => {
			const pkgError = new PkgError();
			expect(pkgError).toBeInstanceOf(PkgError);
			expect(pkgError).toHaveProperty('uuid');
			expect(pkgError).toHaveProperty('date');
			expect(pkgError).toHaveProperty('key', '');
			expect(pkgError).toHaveProperty('httpStatusCode', 500);
			expect(pkgError).toHaveProperty('cause', undefined);
			expect(pkgError).toHaveProperty('message', '');
			expect(pkgError).toHaveProperty('name', 'PkgError');
			expect(pkgError).toHaveProperty('stack');
		});
	});
});
