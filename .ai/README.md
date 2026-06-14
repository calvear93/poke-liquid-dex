# `.ai/` — Spec-driven AI development layer

Tool-neutral home for the **OpenSpec spec-driven development (SDD)** workflow and the reusable
best-practice skills. This is the single source of truth for the skill procedures, task
prompts, and agent roles; each AI tool gets a thin adapter that points here (same philosophy
as [`AGENTS.md`](../AGENTS.md)).

## Layout

```
.ai/
  skills/          canonical skill bodies (the real procedures — edit these)
    spec-intake.md   # optional on-ramp: guided interview to shape any idea into a detailed brief
    spec-propose.md  spec-design.md  spec-tasks.md  spec-implement.md  spec-archive.md
    spec-conventions.md  # OpenSpec format & folder-model reference
    typescript.md  react-patterns.md  zod-schema.md  ioc-binding.md  vitest-tdd.md  vite-config.md
  prompts/         canonical task-prompt bodies (component/page/hook/test creation,
                   blueprints, reviews, llms.txt … — edit these)
  agents/          canonical agent definitions (blueprint, debugger, mentor, react)
  templates/       artifact templates used by the spec skills
    idea.template.md  project.template.md  proposal.template.md  design.template.md
    tasks.template.md  spec.template.md  delta.template.md
specs/             OpenSpec workspace (root)
  project.md       stable project context (read first)
  specs/           living truth — one folder per capability (<capability>/spec.md)
  changes/         active proposals (<change-id>/proposal.md, design.md, tasks.md, specs/ deltas)
    archive/       shipped changes (YYYY-MM-DD-<change-id>/) — the decision log
```

## The spec-driven loop (OpenSpec)

Living specs are the current truth; each request is a **change** (like a DB migration) that
carries spec **deltas** and gets applied on ship. See `skills/spec-conventions.md` for the
exact format.

```
AGENTS.md (constitution) + specs/project.md (context)
  → /spec-intake    rough idea → an idea brief (optional on-ramp: shape a detailed input)
  → /spec-propose   idea    → specs/changes/<id>/proposal.md + specs/<cap>/spec.md deltas (what + why)
  → /spec-design    change  → specs/changes/<id>/design.md   (technical design; skip if trivial)
  → /spec-tasks     change  → specs/changes/<id>/tasks.md    (atomic, test-first tasks)
  → /spec-implement change  → code + tests (typecheck → run Vitest → fix)
  → /spec-archive   change  → verify + apply deltas to specs/specs/ + move to specs/changes/archive/
```

Every step respects `AGENTS.md` and the deep docs in `.github/instructions/`. The
`spec-implement` step runs against the local Vite/Vitest toolchain (`pnpm test` →
`pnpm build` → `pnpm lint`) and reuses the canonical task prompts in `.ai/prompts/`
(component / page / hook / test creation) instead of redefining them. The best-practice skills
(`typescript`, `react-patterns`, `zod-schema`, `ioc-binding`, `vitest-tdd`, `vite-config`) ground the work in the real patterns
under `.vscode/__templates__/`. The official `openspec` CLI is not used (it hardcodes an
`openspec/` root and can't target `specs/`); the skills are the authoritative engine.

## Best-practice & reference skills

Beyond the SDD loop, `skills/` holds best-practice skills any tool can read on demand. They
share the house style (`# Skill: …`, `## When to use`, project formatting) and cross-link each
other: `zod-schema` (validation), `ioc-binding` (dependency injection), `vitest-tdd` (test-first
loop), `vite-config` (build/dev config). Read the relevant one when the task applies; they are
reference skills, not steps in the SDD loop.

## How each tool reaches these files

There is **one** canonical copy of every procedure here. Only GitHub Copilot keeps in-repo
adapter files; the other tools read `.ai/` directly via their root context file. This keeps
the root clean and avoids duplicate command listings.

| Tool           | How it reaches `.ai/`                                                                                                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub Copilot | Native thin pointers under `.github/`: `prompts/spec-*.prompt.md` (spec loop), `prompts/*.prompt.md` (tasks), `agents/*.agent.md`. Invoked as `/spec-propose`, `/component-creation`, … |
| Claude Code    | `CLAUDE.md` links here — reads `.ai/` directly: point the agent at `.ai/skills/spec-<step>.md`, `.ai/prompts/<task>.md`, or `.ai/agents/<role>.md`.                                     |
| Gemini CLI     | `GEMINI.md` links here — same as Claude.                                                                                                                                                |
| Codex          | `AGENTS.md` links here. For native slash commands: `mkdir -p ~/.codex/prompts && cp .ai/skills/spec-*.md .ai/prompts/*.md ~/.codex/prompts/`.                                           |

## Editing rule

Change a procedure **once** in its canonical home (`.ai/skills/`, `.ai/prompts/`, or
`.ai/agents/`). When you add a new skill, prompt, or agent, add its canonical body here and a
one-line pointer under `.github/` for Copilot — the other tools (Claude, Gemini, Codex) read
the `.ai/` files directly through their root context file.
