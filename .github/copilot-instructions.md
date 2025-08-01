## Development Workflow
- **Build:** `bun run build`
- **Test:** `bun run test`, `bun run test:unit`, `bun run test:integration`
- **Lint:** `bun run lint` (auto-fix: `bun run fix-lint`)
- **Docs:** `bun run docs`

## Code Standards & Guidelines

### Required Before Each Commit
- Run `bun run lint` and fix all errors and warnings.
- Run unit `bun run test:unit` or integration `bun run test:integration` tests related to the changes made.
- Ensure documentation is updated if public APIs or complex logic change.

### TypeScript & Project Conventions
1. **Use underscore prefix for private or non-exported elements**  
   (fields, methods, functions, variables):  
   e.g., `_privateMethod`, `_privateVariable`
2. **Always specify visibility modifiers**  
   (`private`, `protected`, `public`) for class methods and properties.  
   Include `readonly`, `override`, and other relevant modifiers when applicable.
3. **Naming conventions:**  
   - `camelCase` for variables, functions, and methods  
   - `PascalCase` for classes, interfaces, and types  
   - `SCREAMING_CASE` for primitive constants
4. **Explicit typing:**  
   - Always specify types for variables, function parameters, and return types  
   - Never use `any` – prefer `unknown` if type cannot be determined  
   - Use type assertions **only when absolutely necessary**  
   - Prefer `interface` over `type` alias for extendable object types
5. **Documentation:**  
   - Document all functions, methods, and code blocks thoroughly with comments  
   - For TypeScript, use **TSDoc** style comments  
   - Always explain purpose, parameters, return values, and behavior  
   - **Only document code when specifically requested**; otherwise, avoid redundant comments  
   - For TSdoc `@throws`, use the format:  
     `@throws ({@link Type}) – {description}`  
   - When documenting an object or interface, **do not** use `@param`; instead, write a comment above each property
6. **Control structures:**  
   - For `if`, `for`, etc., with only a single statement in the body, omit curly braces
7. **Path Aliases:**  
   - Use `#/` for internal imports (for example, `#/errors/baseError`). Do not import "barrel" files; they are only used as entry points.
8. **Export Pattern:**  
   - Each directory should have an `index.ts` that re-exports public items  
   - Types are exported in a separate `types/index.ts`
9. **Testing:**  
   - Write unit tests for all new features  
   - Place tests in the corresponding path under `test/`, matching the structure of `source/`  
   - Use Bun's test runner, with `describe` and `test` blocks  
   - For database/external integrations, use the integration tests directory  
   - Prefer table-driven tests when possible (parameterized cases)
10. **Architecture:**  
    - Maintain existing modular structure and directory organization  
    - Use dependency injection patterns where appropriate  
    - Document all public APIs and any complex or non-trivial logic

## Contribution Principles
1. **Follow TypeScript best practices and idiomatic patterns**
2. **Maintain existing code structure and modular organization**
3. **Keep the developer experience (DX) in mind**
4. **Keep pull requests focused and well-documented with TsDoc (with comments if asked)**
5. **Commit different types of changes separately (features, fixes, refactors, etc.); for example, do not include tests in the same commit as features**

## Commit Message Convention (Conventional Commits + Emoji)

Format:  
`<type>(<emoji>): [summary up to 72 chars]`  
(blank line, then context or description in markdown)

| Type     | Emoji | Use for                            |
|----------|-------|------------------------------------|
| feat     | 🚀    | New features                       |
| fix      | 🔧    | Bug fixes                          |
| perf     | ⚡    | Performance improvements           |
| refactor | 🧹    | Refactoring code                   |
| build    | 📦    | Build tools / dependency changes   |
| types    | 🌊    | Type definitions                   |
| chore    | 🦉    | Maintenance, non-code/test changes |
| examples | 🏀    | Example updates                    |
| docs     | 📖    | Documentation changes              |
| test     | 🧪    | Test code updates                  |
| style    | 🎨    | Style/formatting only              |
| ci       | 🤖    | CI/CD configuration                |

**Example:**
```markdown
feat(🚀): [add my super feature]

## Features
- Implemented a new super feature that does amazing things

## Description
This feature allows users to do X, Y, and Z. It improves the overall user experience by...
```
