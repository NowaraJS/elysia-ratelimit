import { randomUUIDv7 } from 'bun';

import type { PkgErrorOptions } from './types/pkgErrorOptions';

/**
 * A custom error class that extends the native {@link Error} class, providing additional properties
 * such as a unique identifier, error key, HTTP status code, and cause.
 *
 * @template TCause - The type of the cause of the error, which can be any object or error.
 *
 * @example
 * The following example demonstrates how to throw and catch a PkgError.
 * ```typescript
 * try {
 *   throw new PkgError({
 *     message: 'An error occurred',
 *     key: 'example.error',
 *     httpStatusCode: 400,
 *     cause: new Error('Original error')
 *   });
 * } catch (error) {
 *   if (error instanceof PkgError) {
 *     console.error(`Error UUID: ${error.uuid}`);
 *     console.error(`Error Date: ${error.date}`);
 *     console.error(`Error Key: ${error.key}`);
 *     console.error(`HTTP Status Code: ${error.httpStatusCode}`);
 *     console.error(`Cause: ${error.cause}`);
 *   }
 * }
 * ```
 *
 * @example
 * The following example demonstrates how to create a PkgError with a custom cause type.
 * ```typescript
 * const pkgError = new PkgError<{ foo: string }>({
 *     message: 'Custom error with cause',
 *     key: 'pkg-package.error.custom_error',
 *     httpStatusCode: 500,
 *     cause: { foo: 'bar' },
 * });
 * console.log(pkgError.cause); // { foo: 'bar' }
 * ```
 */
export class PkgError<const TCause = unknown> extends Error {
	/**
     * The cause of the error, typically used to store the original error or additional context.
     */
	public override readonly cause: TCause | undefined;

	/**
     * The unique identifier of the error, automatically generated using UUID v7.
     * This identifier is particularly useful for tracking errors in logs.
     */
	private readonly _uuid: string = randomUUIDv7();

	/**
     * The date when the error was created, automatically set to the current date and time.
     */
	private readonly _date: Date = new Date();

	/**
     * A unique key identifying the type of error, useful for localization or error handling.
     */
	private readonly _key: string;

	/**
     * The HTTP status code associated with the error, typically used in API responses.
     */
	private readonly _httpStatusCode: number;

	/**
     * Creates a new instance of the PkgError class.
     *
     * @param pkgErrorOptions - The options for the Pkg error. ({@link PkgErrorOptions})
     */
	public constructor(pkgErrorOptions?: Readonly<PkgErrorOptions<TCause>>) {
		super(pkgErrorOptions?.message);
		super.name = 'PkgError';
		this.cause = pkgErrorOptions?.cause;
		this._key = pkgErrorOptions?.key || '';
		this._httpStatusCode = pkgErrorOptions?.httpStatusCode || 500;
	}

	/**
     * Gets the unique identifier of the error.
     * @returns The UUID of the error.
     */
	public get uuid(): string {
		return this._uuid;
	}

	/**
     * Gets the date when the error was created.
     * @returns The creation date of the error.
     */
	public get date(): Date {
		return this._date;
	}

	/**
     * Gets the error key, which identifies the type of error.
     * @returns The key associated with the error.
     */
	public get key(): string {
		return this._key;
	}

	/**
     * Gets the HTTP status code associated with the error.
     * @returns The HTTP status code.
     */
	public get httpStatusCode(): number {
		return this._httpStatusCode;
	}
}