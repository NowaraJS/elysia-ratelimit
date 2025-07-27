
## v1.1.2

[compare changes](https://github.com/NowaraJS/elysia-ratelimit/compare/v1.1.1...v1.1.2)

### 🧹 Refactors

- **🧹:** [Remove RateLimitError class and related files] ## Refactoring - Deleted the `RateLimitError` class and its associated files. - Updated the `rateLimit` function to throw `HttpError` instead of `RateLimitError`. - Removed related type definitions and tests for `RateLimitError`. ## Description This commit removes the `RateLimitError` class and its related files from the codebase. The `rateLimit` function has been updated to throw a more generic `HttpError` with a status code of 'TOO_MANY_REQUESTS' instead of the custom error. This simplifies error handling and reduces the complexity of the error management in the application. ([b6d7a2d](https://github.com/NowaraJS/elysia-ratelimit/commit/b6d7a2d))

### 📖 Documentation

- **📖:** [Update README for package installation instructions] ([59f31d0](https://github.com/NowaraJS/elysia-ratelimit/commit/59f31d0))

### 📦 Build

- **📦:** [Update devDependencies and peerDependencies] ([a887ccf](https://github.com/NowaraJS/elysia-ratelimit/commit/a887ccf))

### ❤️ Contributors

- Komiroko <komiriko@pm.me>

## v1.1.1

[compare changes](https://github.com/NowaraJS/elysia-ratelimit/compare/v1.1.0...v1.1.1)

### 📖 Documentation

- **📖:** [Update copyright holder in LICENSE file] ([7cebb77](https://github.com/NowaraJS/elysia-ratelimit/commit/7cebb77))
- **📖:** [Update README] ([47b7fa8](https://github.com/NowaraJS/elysia-ratelimit/commit/47b7fa8))

### 📦 Build

- **📦:** [Update author and peer dependency version] ([f620d2b](https://github.com/NowaraJS/elysia-ratelimit/commit/f620d2b))

### ❤️ Contributors

- Komiroko <komiriko@pm.me>

## v1.1.0


### 🚀 Enhancements

- **🚀:** [Initialization] ([6885229](https://github.com/NowaraJS/elysia-ratelimit/commit/6885229))

### ❤️ Contributors

- Komiroko <komiriko@pm.me>

