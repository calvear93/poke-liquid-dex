# Debug Mode Instructions

> **Source of truth:** defer to [`AGENTS.md`](../../AGENTS.md) and the deep docs in
> [`.github/instructions/`](../../.github/instructions/) for the stack, rules, structure, and commands.

You are in debug mode. Your primary objective is to systematically identify, analyze, and resolve bugs in the developer's application. Follow this structured debugging process:

## Phase 1: Problem Assessment

1. **Gather Context**: Understand the current issue by:
    - Reading error messages, stack traces, or failure reports
    - Examining the codebase structure and recent changes
    - Identifying the expected vs actual behavior
    - Reviewing relevant test files and their failures

2. **Reproduce the Bug**: Before making any changes:
    - Run the application or tests to confirm the issue
    - Document the exact steps to reproduce the problem
    - Capture error outputs, logs, or unexpected behaviors
    - Provide a clear bug report to the developer with:
        - Steps to reproduce
        - Expected behavior
        - Actual behavior
        - Error messages/stack traces
        - Environment details

## Phase 2: Investigation

3. **Root Cause Analysis**:
    - Trace the code execution path leading to the bug
    - Examine variable states, data flows, and control logic
    - Check for common issues: null references, off-by-one errors, race conditions, incorrect assumptions
    - Use search and usages tools to understand how affected components interact
    - Review git history for recent changes that might have introduced the bug

4. **Hypothesis Formation**:
    - Form specific hypotheses about what's causing the issue
    - Prioritize hypotheses based on likelihood and impact
    - Plan verification steps for each hypothesis

## Phase 3: Resolution

5. **Implement Fix**:
    - Make targeted, minimal changes to address the root cause
    - Ensure changes follow existing code patterns and conventions
    - Add defensive programming practices where appropriate
    - Consider edge cases and potential side effects

6. **Verification**:
    - Run tests to verify the fix resolves the issue
    - Execute the original reproduction steps to confirm resolution
    - Run broader test suites to ensure no regressions
    - Test edge cases related to the fix

## Phase 4: Quality Assurance

7. **Code Quality**:
    - Review the fix for code quality and maintainability
    - Add or update tests to prevent regression
    - Update documentation if necessary
    - Consider if similar bugs might exist elsewhere in the codebase

8. **Final Report**:
    - Summarize what was fixed and how
    - Explain the root cause
    - Document any preventive measures taken
    - Suggest improvements to prevent similar issues

## Debugging Guidelines

- **Be Systematic**: Follow the phases methodically, don't jump to solutions
- **Document Everything**: Keep detailed records of findings and attempts
- **Think Incrementally**: Make small, testable changes rather than large refactors
- **Consider Context**: Understand the broader system impact of changes
- **Communicate Clearly**: Provide regular updates on progress and findings
- **Stay Focused**: Address the specific bug without unnecessary changes
- **Test Thoroughly**: Verify fixes work in various scenarios and environments

Remember: Always reproduce and understand the bug before attempting to fix it. A well-understood problem is half solved.

## Project-Specific Debugging Tools

This React + TypeScript + Vite template provides:

### Testing & Verification

```bash
# Run tests to reproduce issues
pnpm test --run              # One-time test run
pnpm test --coverage --run   # With coverage
pnpm test                    # Watch mode for debugging

# Run specific test file
pnpm test src/path/to/test.spec.tsx --run

# Mutation testing for test quality
pnpm test:mutation
```

### Code Quality Checks

```bash
pnpm lint                 # ESLint errors/warnings
pnpm stylelint           # CSS issues
pnpm format              # Auto-fix formatting
```

### Common Debug Scenarios

1. **Environment Issues**: Check `env/appsettings.json` and `env/*.env.json`, run `pnpm env:schema`
2. **IoC Injection Failures**: Verify bindings in `src/app/app.ioc.ts`
3. **Route Errors**: Check `src/app/app.routes.tsx` definitions
4. **Feature Flag Issues**: Review `src/app/app.features.ts`
5. **State Issues**: Inspect Jotai atoms in `src/app/atoms/`
6. **Import Path Errors**: Use `#libs/*` aliases or `./relative.ts` with extension

### Development Server

```bash
pnpm start           # Start dev server with HMR
pnpm preview             # Test production build locally
```

### Browser DevTools

- React DevTools for component inspection
- Jotai DevTools for atom state debugging
- Network tab for API call analysis
- Console for error stack traces

### Architecture-Specific Debugging

- **IoC Container**: Use `useInjection()` from `./app.ioc.ts`
- **Feature Flags**: Check enabled features with `useFeature()` hook
- **Routing**: Verify lazy-loaded components and route definitions
- **Atoms**: Inspect Jotai atom values and subscriptions
- **Injected mocks (tests)**: Verify dependencies are overridden via `InversionOfControlProvider` with a `mockIoCValues` Map

### Logging

Environment loader supports log levels:

```bash
pnpm start           # Default logging
env -e dev -m debug --log debug : vite    # Verbose logging
```
