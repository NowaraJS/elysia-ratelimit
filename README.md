# 🛡️ NowaraJS - Elysia Rate Limit

## 📌 Table of Contents

- [🛡️ Elysia Rate Limit](#-elysia-rate-limit)
	- [📌 Table of Contents](#-table-of-contents)
	- [📝 Description](#-description)
	- [✨ Features](#-features)
	- [🔧 Installation](#-installation)
	- [⚙️ Usage](#-usage)
		- [Basic Setup (In-Memory Store)](#basic-setup-in-memory-store)
		- [Redis Store Setup (Production)](#redis-store-setup-production)
		- [Storage Options](#storage-options)
		- [Route-Level Configuration](#route-level-configuration)
		- [Global Rate Limit with Route Overrides](#global-rate-limit-with-route-overrides)
	- [📊 Rate Limit Headers](#-rate-limit-headers)
	- [📚 API Reference](#-api-reference)
	- [⚖️ License](#-license)
	- [📧 Contact](#-contact)

## 📝 Description

> A powerful rate limiting plugin for Elysia applications with flexible storage backend support.

**Elysia Rate Limit** provides comprehensive rate limiting capabilities to protect your Elysia APIs from excessive use and potential abuse. It tracks request rates by client IP address and enforces configurable limits based on a fixed time window approach. The plugin supports multiple storage backends through the `@nowarajs/kv-store` ecosystem, including in-memory storage for development and Redis for distributed production environments.

## ✨ Features

- 🔒 **IP-based Rate Limiting**: Automatically tracks requests by client IP
- 📊 **Fixed Window**: Uses fixed window algorithm for predictable rate limiting
- 🏪 **Multiple Storage Backends**: Support for in-memory and Redis storage via @nowarajs/kv-store
- 📈 **Standard Headers**: Adds X-RateLimit-* headers for client awareness
- ⚡ **High Performance**: Optimized for minimal latency impact
- 🛠️ **Easy Integration**: Simple plugin architecture for Elysia
- 🎯 **Configurable**: Flexible limits and time windows
- 🔄 **Development Ready**: In-memory storage for local development

## 🔧 Installation

```bash
bun add @nowarajs/elysia-ratelimit @nowarajs/error @nowarajs/kv-store elysia
```
## ⚙️ Usage

### Basic Setup (In-Memory Store)

```ts
import { Elysia } from 'elysia';
import { rateLimit } from '@nowarajs/elysia-ratelimit';

// Create application with rate limiting (uses in-memory store by default)
const app = new Elysia()
	.use(rateLimit())
	.get('/api/data', () => {
		return { success: true, message: 'This endpoint is rate limited' };
	}, {
		rateLimit: {
			limit: 100,           // 100 requests
			window: 60,           // per minute (60 seconds)
		}
	});

app.listen(3000);
```

### Redis Store Setup (Production)

```ts
import { Elysia } from 'elysia';
import { IoRedisStore } from '@nowarajs/kv-store';
import { rateLimit } from '@nowarajs/elysia-ratelimit';

// Create Redis store instance
const redisStore = new IoRedisStore({
	host: 'localhost',
	port: 6379
});
await redisStore.connect();

// Create application with Redis-backed rate limiting
const app = new Elysia()
	.use(rateLimit(redisStore))
	.get('/api/data', () => {
		return { success: true, message: 'This endpoint is rate limited' };
	}, {
		rateLimit: {
			limit: 100,           // 100 requests
			window: 60,           // per minute (60 seconds)
		}
	});

app.listen(3000);
```

### Storage Options

| Store Type | Usage | Best For |
|------------|-------|----------|
| Default (`:memory:`) | `rateLimit()` | Development, single instance |
| Explicit Memory | `rateLimit(new MemoryStore())` | When you need store reference |
| Redis Store | `rateLimit(redisStore)` | Production, distributed systems |

### Route-Level Configuration

Rate limits can be configured per route using the `rateLimit` macro:

```ts
const app = new Elysia()
	.use(rateLimit())
	.get('/api/endpoint', () => 'content', {
		rateLimit: {
			limit: 100,
			window: 60
		}
	});
```

### Global Rate Limit with Route Overrides

Use `.guard()` to set a global rate limit and override it on specific routes:

```ts
const app = new Elysia()
	.use(rateLimit())
	.guard({
		rateLimit: {
			limit: 100,
			window: 60
		}
	})
	.get('/api/slow', () => 'content', {
		rateLimit: {
			limit: 10,          // Override: stricter limit for this route
			window: 60
		}
	})
	.get('/api/fast', () => 'content')  // Uses global limit
	.listen(3000);
```

## 📊 Rate Limit Headers

The plugin automatically adds these headers to all responses:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum number of requests allowed in the window |
| `X-RateLimit-Remaining` | Number of requests remaining in current window |
| `X-RateLimit-Reset` | Time in seconds until the rate limit resets |

## 📚 API Reference

You can find the complete API reference documentation for `Elysia Rate Limit Plugin` at:

- [Reference Documentation](https://nowarajs.github.io/elysia-ratelimit/)

## ⚖️ License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.

## 📧 Contact

- Mail: [nowarajs@pm.me](mailto:nowarajs@pm.me)
- GitHub: [NowaraJS](https://github.com/NowaraJS)