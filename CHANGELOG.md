
## v1.3.0

[compare changes](https://github.com/NowaraJS/elysia-ratelimit/compare/v1.2.5...v1.3.0)

### 🚀 Enhancements

- **🚀:** [update rate limiting examples to use IoRedisStore] ([9465dfa](https://github.com/NowaraJS/elysia-ratelimit/commit/9465dfa))

### 📖 Documentation

- **📖:** [remove outdated CHANGELOG entries for v1.2.5] ([5ac496d](https://github.com/NowaraJS/elysia-ratelimit/commit/5ac496d))
- **📖:** [fix example of TSdoc in ratelimit] ([36f2b9e](https://github.com/NowaraJS/elysia-ratelimit/commit/36f2b9e))

### 📦 Build

- **📦:** [update dependencies in package.json] ## Build Changes - Updated `@types/bun` from `^1.2.20` to `^1.2.21` - Updated `typescript-eslint` from `^8.40.0` to `^8.41.0` ([d704b82](https://github.com/NowaraJS/elysia-ratelimit/commit/d704b82))

### 🌊 Types

- **🌊:** [update RateLimitOptions to use KvStore instead of Redis] ## Type Changes - Updated the `store` property in `RateLimitOptions` to accept a `KvStore` instance instead of a `Redis` instance. ## Description This change enhances the flexibility of the rate limiting options by allowing the use of a more generic key-value store, aligning with the current architecture and improving compatibility with various storage backends. ([cb9a246](https://github.com/NowaraJS/elysia-ratelimit/commit/cb9a246))

### 🦉 Chore

- **🦉:** [update package.json dependencies and peerDependencies] ([25b3026](https://github.com/NowaraJS/elysia-ratelimit/commit/25b3026))
- **🦉:** [remove unused MemoryStoreEntry type definition] ([6b2264e](https://github.com/NowaraJS/elysia-ratelimit/commit/6b2264e))
- **🦉:** [remove MemoryStore class and related types] ([f1f7a62](https://github.com/NowaraJS/elysia-ratelimit/commit/f1f7a62))
- **🦉:** [remove RateLimitStore interface definition] Removed the RateLimitStore interface from the codebase as it is no longer needed. This cleanup helps maintain a leaner code structure and reduces potential confusion regarding unused types. ([44868f9](https://github.com/NowaraJS/elysia-ratelimit/commit/44868f9))

### 🧪 Tests

- **🧪:** [remove MemoryStore tests] ([75491d5](https://github.com/NowaraJS/elysia-ratelimit/commit/75491d5))
- **🧪:** [refactor rate limit tests to use MemoryStore] ([303cf42](https://github.com/NowaraJS/elysia-ratelimit/commit/303cf42))

### ❤️ Contributors

- Komiroko <komiriko@pm.me>

