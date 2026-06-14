# Skill: Spec — Tasks

Break an approved change into atomic, ordered, **test-first** tasks.

## When to use

After `/spec-design` (or directly after `/spec-propose` for trivial changes). Input:
`specs/changes/<change-id>/` (`proposal.md` + deltas + `design.md` if present).

## Procedure

1. **Read** the proposal, deltas, and design.
2. **Write `specs/changes/<change-id>/tasks.md`** from `.ai/templates/tasks.template.md`.
3. **Make each task atomic and verifiable:**
    - One coherent unit (a page, a component, a custom hook, a Jotai atom, a Zod schema, an IoC
      binding, a route entry) — small enough to implement, typecheck, and test
      in isolation.
    - **Test-first:** each task names the co-located Vitest spec it adds/updates
      (`*.spec.tsx` / `*.spec.ts` next to the source) and the delta requirement it covers
      (`<capability> › <Requirement name>`).
    - Explicit "done when" (a passing assertion and a clean typecheck/lint).
4. **Order by dependency:** schemas/types → atoms/state → IoC bindings → hooks → components →
   pages → routes → integration. A task should not depend on a later one.
5. **Ensure full traceability:** every requirement/scenario in the change deltas maps to ≥ 1
   task in the traceability table. No orphan requirements, no tasks without a requirement.
6. **Keep scope honest:** if a task is large or vague, split it. Note anything deferred.

## Output

- The tasks path, the task count, and confirmation that the traceability table covers every
  delta requirement.
- **Next step:** `/spec-implement`.
