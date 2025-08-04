export interface MemoryStoreEntry {
	/**
	 * Current count value for the key.
	 */
	readonly value: string;
	/**
	 * Timestamp when this entry expires (in milliseconds).
	 */
	readonly expiresAt: number;
}