
Purpose: provide consistent, test-first, review-ready code generation and PR guidance for this JavaScript / Node / npm repository.

## General rules
1. Always generate code that is small, focused, and has a single responsibility.
2. Use clear, descriptive function and variable names in `camelCase`.
3. Prefer explicitness over cleverness: easy-to-read code wins.
4. Include short inline comments only when the code intent is not obvious.

## Testing rules (mandatory)
- Every generated feature or function must include unit tests.
- Tests must follow the AAA pattern with comments: `// given`, `// when`, `// then`.
- High-level `describe` strings must start with the test path. Example:
    - `describe('Unit | Identities Access Management | Repositories | User repository', () => { ... })`
- Use Vitest as test runner; run tests with `npm test` (or the repo's configured test script).
- Test file naming:
    - Mirror source path. Example: source `src/repositories/userRepository.js` → test `tests/unit/repositories/userRepository.test.js`.
- Tests must assert behavior, not implementation details.

## Test structure example
Include this example exactly for generated tests:

```javascript
// tests/unit/repositories/userRepository.test.js
describe('Unit | Identities Access Management | Repositories | User repository', () => {
  describe('#getById', () => {
    it('should return user by id', () => {
      // given
      const userId = 'user-123'
      const repo = createUserRepositoryWithTestData()

      // when
      const result = repo.getById(userId)

      // then
      expect(result).toBeDefined()
      expect(result.id).toBe(userId)
    })
  })
})
## Test content conventions
Use const for immutable bindings.
Mock external dependencies explicitly and keep mocks in __mocks__ or inline using Vitest mocks.
Avoid heavy fixtures; prefer factories that are easy to read.
All tests must pass locally and on CI before requesting a review.
## Pull request title (conventional commit)
Titles must follow Conventional Commits:
type(scope): short description
Examples:
feat(auth): add JWT refresh token support
fix(api): handle missing query param
chore(deps): update lodash to ^4.17.21
Use scope that maps to the main package or feature area.

## Pull request body (template)
Follow the default pull request template of this repository and detail the testing process.
If no tests are required, explicitly state why and what manual checks were performed.
## Commit requirements before PR
All new code must have unit tests with the AAA pattern.
Run npm test and fix failures.
Run linter and formatter (npm run lint, npm run format) if configured.
Squash or rebase commits into a logical commit that follows Conventional Commits before requesting review.
## CI / Automation
The PR must pass CI (tests + lint) before requesting review.
If CI has flaky tests, document the flakes and open a follow-up task.
## Additional useful guidance
Provide examples in generated code when it clarifies usage (short snippet).
When generating migrations, DB changes, or breaking changes, include a BREAKING CHANGE: section in the PR body.
Add or update README snippets only if they help developers run or test the feature.
For exported APIs, include JSDoc comments for public functions.

## File to store these instructions
Place these instructions in /.github/copilot-instructions.md (already present).
