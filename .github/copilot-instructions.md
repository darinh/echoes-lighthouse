# Copilot Agent Instructions — Echoes of the Lighthouse

## Git Worktree Rule (MANDATORY for all agents)

**Every sub-agent MUST get its own git worktree.** Never share `/workspaces/echoes-lighthouse`
between concurrent agents — branch-switching collisions corrupt in-progress work.

**Before spawning any agent, the Operator creates a dedicated worktree:**

```bash
# One-time setup per feature
git worktree add /workspaces/wt-<feature> -b <prefix>/<feature> origin/main
cd /workspaces/wt-<feature> && npm install

# Then pass /workspaces/wt-<feature> as the agent's working directory
```

**The agent prompt must include:**
- `Work EXCLUSIVELY in /workspaces/wt-<feature> — do NOT touch /workspaces/echoes-lighthouse`
- All git commands run from the worktree path
- `npm run typecheck` / `npm test` run from the worktree path

**Cleanup after merge:**
```bash
git worktree remove /workspaces/wt-<feature>
```

---

## Branching Rules (mandatory)

You are working in a protected repository. You **must not** push directly to `main` or `develop`.
Branch protection is enforced for all actors including admins.

**Every piece of work must follow this flow:**

```
1. git worktree add /workspaces/wt-<feature> -b <prefix>/<feature> origin/main
2. cd /workspaces/wt-<feature> && npm install
3. Make changes, commit with conventional commit messages
4. git push origin <your-branch>
5. Open a PR targeting main via the GitHub API
```

**Branch prefixes:**
- `feature/` — new gameplay, systems, UI
- `fix/` — bug fixes
- `content/` — locale strings, NPC data, quest data, lore
- `refactor/` — internal restructure, no behaviour change
- `test/` — tests only
- `docs/` — documentation
- `chore/` — CI, tooling, dependencies

## Commit Message Format (mandatory)

Use [Conventional Commits](https://www.conventionalcommits.org/). This drives automatic versioning.

```
<type>(<scope>): <short description>

[optional body]

[optional footer — BREAKING CHANGE: description]
```

Types: `feat` `fix` `perf` `content` `refactor` `test` `docs` `chore`

Scopes (use the module name): `systems` `engine` `world` `entities` `ui` `audio` `renderer` `i18n` `data` `ci` `interfaces`

**Version impact:**
- `feat:` → minor bump on next release
- `fix:` / `perf:` → patch bump
- `feat!:` or `BREAKING CHANGE:` footer → major bump
- Everything else → no bump

## Interface Rules (critical)

`src/interfaces/` contains the stable module contracts. **Do not modify any `I*.ts` file** without explicit instruction from the Operator. Changes to interfaces break all implementing classes and must be coordinated.

## Spec Compliance

All implementation must conform to `docs/gdd/`. When implementing a system:
1. Read the relevant GDD section first
2. Write spec-compliance tests that cite the section (e.g. `[GDD §1.2]`)
3. Implement to make those tests pass

## Testing Requirements

All PRs to `develop` must pass CI:
- `npm run typecheck` — zero TypeScript errors
- `npm run test` — all Vitest tests pass

Do not skip or suppress tests. Do not use `@ts-ignore` or `// eslint-disable` without explanation.

## Architecture

- Cross-module communication: **events only** via `IEventBus` — never import sibling module implementations
- All user-visible strings: **`t('key')` only** — never hardcode display text
- Content data: **lazy-loaded** via dynamic `import()` — never eagerly import from `src/data/`
- Providers are **swappable** — engine code only calls `IAudioProvider` / `IRenderer`, never concrete classes

See `docs/ARCHITECTURE.md` for the full guide.
