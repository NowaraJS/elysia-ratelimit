import { randomUUIDv7 } from 'bun';

import type { RateLimitErrorOptions } from './types/rateLimitErrorOptions';

export class RateLimitError<const T = unknown> extends Error {
	public override readonly cause: T | undefined;

	private readonly _uuid: string = randomUUIDv7();

	private readonly _date: Date = new Date();

	private readonly _httpStatusCode: number;

	public constructor(rateLimitErrorOptions?: Readonly<RateLimitErrorOptions<T>>) {
		super(rateLimitErrorOptions?.message);
		super.name = 'RateLimitError';
		this.cause = rateLimitErrorOptions?.cause;
		this._httpStatusCode = rateLimitErrorOptions?.httpStatusCode || 500;
	}

	public get uuid(): string {
		return this._uuid;
	}

	public get date(): Date {
		return this._date;
	}

	public get httpStatusCode(): number {
		return this._httpStatusCode;
	}
}
