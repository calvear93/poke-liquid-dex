# Skill: Spec — Design

Turn an approved proposal into a technical design. **How, grounded in this template's
architecture.** Optional for trivial changes.

## When to use

After `/spec-propose`, once `proposal.md` + deltas are approved and the change is non-trivial
(new page, shared component, custom hook, atom/state slice, route, schema, IoC binding,
cross-cutting refactor). Skip it for a doc-only or one-line behavior tweak — note the skip in
`tasks.md`. Input: `specs/changes/<change-id>/`.

## Procedure

1. **Read** the proposal, its deltas, the target living specs under `specs/specs/`, plus
   `AGENTS.md` and `.github/instructions/architecture-guide.instructions.md`. Explore the
   relevant existing code (`src/app/`, `src/libs/`) and the canonical scaffolds in
   `.vscode/__templates__/` before designing.
2. **Write `specs/changes/<change-id>/design.md`** from `.ai/templates/design.template.md`.
3. **Design within the React SPA architecture (`src/app`, `src/libs`).** There is **no**
   backend or database layer — model everything as client-side UI, state, and API access:
    - **Pages** in `src/app/pages/<page-name>/` (`*.page.tsx` + `*.page.module.css` +
      `*.page.spec.tsx`), wired into `src/app/app.routes.tsx` through React Router
      (`#libs/router`). Page-local components and atoms live under that page folder.
    - **Components** in `src/app/components/<category>/` (`*.tsx` + `*.module.css` +
      `*.spec.tsx`). Keep them declarative and accessible (semantic HTML + ARIA); push logic
      into hooks. Styling is CSS Modules + UnoCSS.
    - **State** with Jotai atoms (`*.atom.ts`: private `_inner…Atom` + public read/write
      `atom`) plus React hooks. Custom hooks hold the business logic; components stay thin.
    - **Schemas / validation** with Zod (`*.schema.ts`): form data, API responses, and complex
      prop validation. Never use `any`; prefer `unknown` + narrowing. See `zod-schema` skill.
    - **Config & dependencies** flow through the IoC container — bind in the bootstrap layer
      (`src/app/app.ioc.ts` → `createContainer()` from `#libs/ioc`) and consume via
      `useInjection`. Never hardcode URLs/keys or scatter `import.meta.env`. See `ioc-binding`.
    - **Data fetching** through services bound in the IoC container (inject an HTTP/fetch
      client; never call `fetch` ad-hoc in components). Validate API payloads with Zod.
    - **Feature flags** via `#libs/feature` (`src/app/app.features.ts`) when gating behavior.
4. **Record decisions** explicitly (what / why / alternatives) so the change folder is the
   durable rationale.
5. **Map requirements → testing strategy** (Vitest + React Testing Library `*.spec.tsx`/
   `*.spec.ts` co-located with source; assert on user-visible output). See `vitest-tdd` skill.
6. **Call out risks/trade-offs:** error/loading states, accessibility, async boundaries and
   error-path handling, config-injection seams, mock vs real API, coverage targets, rollback.
7. **Stay minimal (YAGNI).** No task list yet — that is `/spec-tasks`.

## Output

- The design path and a short summary of the approach + affected components/pages/hooks/libs.
- Flag any proposal ambiguity discovered (loop back to `/spec-propose` if material).
- **Next step:** `/spec-tasks`.
