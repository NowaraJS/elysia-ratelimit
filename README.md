# 🛡️ NowaraJS - Elysia Rate Limit

## 📌 Table of Contents

- [🛡️ Elysia Rate Limit](#-elysia-rate-limit)
	- [📌 Table of Contents](#-table-of-contents)
	- [📝 Description](#-description)
	- [✨ Features](#-features)
	- [🔧 Installation](#-installation)
	- [⚙️ Usage](#-usage)
	- [📊 Rate Limit Headers](#-rate-limit-headers)
	- [📚 API Reference](#-api-reference)
	- [⚖️ License](#-license)
	- [📧 Contact](#-contact)

## 📝 Description

> A powerful rate limiting plugin for Elysia applications with Redis backend support.

**Elysia Rate Limit** provides comprehensive rate limiting capabilities to protect your Elysia APIs from excessive use and potential abuse. It tracks request rates by client IP address and enforces configurable limits based on a sliding time window approach using Redis for distributed rate limiting.

## ✨ Features

- 🔒 **IP-based Rate Limiting**: Automatically tracks requests by client IP
- 📊 **Sliding Window**: Uses sliding window algorithm for accurate rate limiting
- 🚀 **Redis Backend**: Distributed rate limiting with Redis support
- 📈 **Standard Headers**: Adds X-RateLimit-* headers for client awareness
- ⚡ **High Performance**: Optimized for minimal latency impact
- 🛠️ **Easy Integration**: Simple plugin architecture for Elysia
- 🎯 **Configurable**: Flexible limits and time windows

## 🔧 Installation

```bash
bun add @nowarajs/elysia-ratelimit @nowarajs/error ioredis elysia
```

> **Note**: This package requires Redis and the `ioredis` client library.

## ⚙️ Usage

### Basic Setup

```ts
import { Elysia } from 'elysia';
import { Redis } from 'ioredis';
import { rateLimit } from '@nowarajs/elysia-ratelimit';

// Create Redis instance
const redis = new Redis({
	host: 'localhost',
	port: 6379
});
await redis.connect();

// Create application with rate limiting
const app = new Elysia()
	.use(rateLimit({
		redis,
		limit: 100,           // 100 requests
		window: 60,           // per minute (60 seconds)
		message: 'Too many requests, please try again later.'
	}))
	.get('/api/data', () => {
		return { success: true, message: 'This endpoint is rate limited' };
	});

app.listen(3000);
```

### Configuration Options

```ts
interface RateLimitOptions {
	redis: Redis;           // Redis instance for storage
	limit: number;          // Maximum requests allowed
	window: number;         // Time window in seconds
	message?: string;       // Custom error message (optional)
}
```

### Advanced Usage

```ts
// Different rate limits for different routes
const app = new Elysia()
	.use(rateLimit({
		redis,
		limit: 1000,    // Higher limit for general API
		window: 3600    // Per hour
	}))
	.group('/auth', (app) => 
		app
			.use(rateLimit({
				redis,
				limit: 5,     // Stricter limit for auth endpoints
				window: 300   // Per 5 minutes
			}))
			.post('/login', loginHandler)
			.post('/register', registerHandler)
	);
```

## 📊 Rate Limit Headers

The plugin automatically adds these headers to all responses:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum number of requests allowed in the window |
| `X-RateLimit-Remaining` | Number of requests remaining in current window |
| `X-RateLimit-Reset` | Time in seconds until the rate limit resets |

### Example Response Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 45
```

## 📚 API Reference

You can find the complete API reference documentation for `Elysia Rate Limit Plugin` at:

- [Reference Documentation](https://nowarajs.github.io/elysia-ratelimit/)

## ⚖️ License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.

## 📧 Contact

- GitHub: [NowaraJS](https://github.com/NowaraJS)
- Package: [@nowarajs/elysia-ratelimit](https://www.npmjs.com/package/@nowarajs/elysia-ratelimit)
