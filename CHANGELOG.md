
## v1.5.0

[compare changes](https://github.com/NowaraJS/elysia-ratelimit/compare/v1.4.3...v1.5.0)

### 🚀 Enhancements

- **🚀:** [New ratelimit plugin with macro] ([2a00f28](https://github.com/NowaraJS/elysia-ratelimit/commit/2a00f28))

### 🧹 Refactors

- **🧹:** [improve key] ([fb2f733](https://github.com/NowaraJS/elysia-ratelimit/commit/fb2f733))

### 📖 Documentation

- **📖:** [Update readme] ([ad48c7c](https://github.com/NowaraJS/elysia-ratelimit/commit/ad48c7c))

### 📦 Build

- **📦:** [Update devDependencies and peerDependencies versions] ## Build Changes - Updated `@eslint/js` from `^9.38.0` to `^9.39.1` - Updated `@nowarajs/error` from `^1.3.7` to `^1.3.10` - Updated `@nowarajs/kv-store` from `^1.2.2` to `^1.3.0` - Updated `@types/bun` from `^1.3.0` to `^1.3.2` - Updated `elysia` from `^1.4.13` to `^1.4.16` - Updated `eslint` from `^9.38.0` to `^9.39.1` - Updated `globals` from `^16.4.0` to `^16.5.0` - Updated `typescript-eslint` from `^8.46.2` to `^8.46.4` - Updated peer dependencies for `@nowarajs/error`, `@nowarajs/kv-store`, and `elysia` to match the new versions. ([cb5ae31](https://github.com/NowaraJS/elysia-ratelimit/commit/cb5ae31))

### 🦉 Chore

- **🦉:** [Update .gitignore to include .vscode and .zed] Added .vscode and .zed to the .gitignore file to prevent IDE/editor files from being tracked in the repository. ([d2bded4](https://github.com/NowaraJS/elysia-ratelimit/commit/d2bded4))
- **🦉:** [Update .npmignore to include .zed and bench directories] ([22389ff](https://github.com/NowaraJS/elysia-ratelimit/commit/22389ff))

### 🧪 Tests

- **🧪:** [new tests for new plugin ratelimit] ([647f80c](https://github.com/NowaraJS/elysia-ratelimit/commit/647f80c))

### 🤖 CI

- **🤖:** [Rename CI workflow from main-ci to main-test] ([ca03e18](https://github.com/NowaraJS/elysia-ratelimit/commit/ca03e18))

### ❤️ Contributors

- Komiroko <komiriko@pm.me>

## v1.4.3

[compare changes](https://github.com/NowaraJS/elysia-ratelimit/compare/v1.4.2...v1.4.3)

### 🔧 Fixes

- **🔧:** [Add temporary fix Bun 1.3 Server] ([c094ce1](https://github.com/NowaraJS/elysia-ratelimit/commit/c094ce1))

### 📦 Build

- **📦:** [Update devDependencies and peerDependencies in package.json] ([69cce23](https://github.com/NowaraJS/elysia-ratelimit/commit/69cce23))

### 🦉 Chore

- **🦉:** [Remove Dependabot configuration file] ([52c65ae](https://github.com/NowaraJS/elysia-ratelimit/commit/52c65ae))
- **🦉:** [Add semver field to changelog types] ([5b918b1](https://github.com/NowaraJS/elysia-ratelimit/commit/5b918b1))

### 🧪 Tests

- **🧪:** [Convert describe blocks to concurrent for better performance] ([43f49b5](https://github.com/NowaraJS/elysia-ratelimit/commit/43f49b5))

### 🎨 Styles

- **🎨:** [Update ESLint configuration for improved styling rules] ([c9e1e38](https://github.com/NowaraJS/elysia-ratelimit/commit/c9e1e38))

### 🤖 CI

- **🤖:** [Update CI/CD workflows and actions for Bun project setup] ([729858c](https://github.com/NowaraJS/elysia-ratelimit/commit/729858c))

### ❤️ Contributors

- Komiroko <komiriko@pm.me>

## v1.4.2

[compare changes](https://github.com/NowaraJS/elysia-ratelimit/compare/v1.4.1...v1.4.2)

### 🔧 Fixes

- **🔧:** [Correct rate limit error key format] Update the RATE_LIMIT_EXCEEDED key to use the correct format for the error key string. ([90f5af9](https://github.com/NowaraJS/elysia-ratelimit/commit/90f5af9))

### ❤️ Contributors

- Komiroko <komiriko@pm.me>

## v1.4.1

[compare changes](https://github.com/NowaraJS/elysia-ratelimit/compare/v1.4.0...v1.4.1)

### 📦 Build

- **📦:** [Update Dependencies] ([6efa2d9](https://github.com/NowaraJS/elysia-ratelimit/commit/6efa2d9))

### ❤️ Contributors

- Komiroko <komiriko@pm.me>

## v1.4.0

[compare changes](https://github.com/NowaraJS/elysia-ratelimit/compare/v1.3.5...v1.4.0)

### 🚀 Enhancements

- **🚀:** [Add RATE_LIMIT_ERROR_KEYS export] ([39d1064](https://github.com/NowaraJS/elysia-ratelimit/commit/39d1064))

### 📦 Build

- **📦:** [Update dependencies in package.json] ## Build Changes - Updated `@eslint/js` from `^9.34.0` to `^9.35.0` - Updated `@nowarajs/error` from `^1.3.0` to `^1.3.1` - Updated `@nowarajs/kv-store` from `^1.1.4` to `^1.1.5` - Updated `@types/bun` from `^1.2.21` to `^1.2.22` - Updated `elysia` from `^1.3.21` to `^1.4.5` - Updated `eslint` from `^9.34.0` to `^9.35.0` - Updated `globals` from `^16.3.0` to `^16.4.0` - Updated `typescript-eslint` from `^8.42.0` to `^8.43.0` - Updated peer dependencies for `@nowarajs/error`, `@nowarajs/kv-store`, and `elysia` to their latest versions. ([e3f2f7f](https://github.com/NowaraJS/elysia-ratelimit/commit/e3f2f7f))

### 🦉 Chore

- **🦉:** [Update Dependabot schedule to weekly] ([4471e85](https://github.com/NowaraJS/elysia-ratelimit/commit/4471e85))

### ❤️ Contributors

- Komiroko <komiriko@pm.me>

## v1.3.5

[compare changes](https://github.com/NowaraJS/elysia-ratelimit/compare/v1.3.4...v1.3.5)

### 📦 Build

- **📦:** [Update @nowarajs/kv-store and @nowarajs/error dependencies] - Updated `@nowarajs/kv-store` from `^1.1.3` to `^1.1.4` in `devDependencies`. - Updated `@nowarajs/error` from `^1.1.8` to `^1.3.0` in `peerDependencies`. ([411e510](https://github.com/NowaraJS/elysia-ratelimit/commit/411e510))

### ❤️ Contributors

- Komiroko <komiriko@pm.me>

## v1.3.4

[compare changes](https://github.com/NowaraJS/elysia-ratelimit/compare/v1.3.3...v1.3.4)

### 🧹 Refactors

- **🧹:** [Rename files to kebab-case and refacto BaseError V1.3] ([209f61c](https://github.com/NowaraJS/elysia-ratelimit/commit/209f61c))

### 📦 Build

- **📦:** [Update dependencies in package.json] ([fc262b3](https://github.com/NowaraJS/elysia-ratelimit/commit/fc262b3))

### 🦉 Chore

- **🦉:** [Add Dependabot configuration for package updates] ([198e8bf](https://github.com/NowaraJS/elysia-ratelimit/commit/198e8bf))

### ❤️ Contributors

- Komiroko <komiriko@pm.me>

## v1.3.3

[compare changes](https://github.com/NowaraJS/elysia-ratelimit/compare/v1.3.2...v1.3.3)

### 📦 Build

- **📦:** [Update dependencies in package.json and bun.lock] ([107a38c](https://github.com/NowaraJS/elysia-ratelimit/commit/107a38c))

### 🦉 Chore

- **🦉:** [Update .npmignore for better file management] ([59818ad](https://github.com/NowaraJS/elysia-ratelimit/commit/59818ad))

### 🤖 CI

- **🤖:** [Remove CHANGELOG.md before publishing to NPM] ([691baae](https://github.com/NowaraJS/elysia-ratelimit/commit/691baae))

### ❤️ Contributors

- Komiroko <komiriko@pm.me>

## v1.3.2

[compare changes](https://github.com/NowaraJS/elysia-ratelimit/compare/v1.3.1...v1.3.2)

### 🧹 Refactors

- **🧹:** [update MemoryStore import path for clarity] ## Refactoring - Changed the import path for MemoryStore from '@nowarajs/kv-store' to '@nowarajs/kv-store/memory'. ([69ca379](https://github.com/NowaraJS/elysia-ratelimit/commit/69ca379))

### 📦 Build

- **📦:** [update @nowarajs/kv-store dependency version] ([7620445](https://github.com/NowaraJS/elysia-ratelimit/commit/7620445))

### 🦉 Chore

- **🦉:** [remove outdated entries from CHANGELOG.md] ([6d58fff](https://github.com/NowaraJS/elysia-ratelimit/commit/6d58fff))

### 🧪 Tests

- **🧪:** [remove memoryStore.spec.ts test file] ([c7a6251](https://github.com/NowaraJS/elysia-ratelimit/commit/c7a6251))
- **🧪:** [update MemoryStore import path for clarity] ([be37164](https://github.com/NowaraJS/elysia-ratelimit/commit/be37164))

### 🤖 CI

- **🤖:** [remove bun-version specification in CI workflows] ([41a0580](https://github.com/NowaraJS/elysia-ratelimit/commit/41a0580))

### ❤️ Contributors

- Komiroko <komiriko@pm.me>

