# Contributing to Echoes of the Lighthouse

## Branching Strategy

```
main        ← stable, released, deployed to GitHub Pages
  └── develop     ← integration branch; all feature work lands here
        └── feature/your-feature-name
        └── fix/your-fix-name
        └── content/npc-maren-dialogue
```

### Branch naming conventions

| Prefix | When to use | Example |
|---|---|---|
| `feature/` | New gameplay, new system, new UI panel | `feature/journal-panel` |
| `fix/` | Bug fix | `fix/loop-reset-insight` |
| `content/` | Locale strings, NPC data, quest data, lore | `content/npc-silas-tier3` |
| `refactor/` | Internal restructure, no behaviour change | `refactor/knowledge-system` |
| `docs/` | GDD updates, architecture notes | `docs/systems-design-update` |
| `test/` | Adding or fixing tests only | `test/knowledge-system-coverage` |
| `chore/` | CI, tooling, deps | `chore/vitest-setup` |

---

## Daily Workflow

### Starting a new piece of work

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### Committing

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(systems): implement insight daily cap per GDD §1.2
fix(loop): preserve banked insight on death
content(dialogue): add Maren tier 3-5 dialogue trees
test(systems): add KnowledgeSystem spec-compliance suite
docs(gdd): update 04-systems-design with balance tuning notes
chore(ci): add Vitest to test pipeline
```

The commit type feeds into auto-generated release notes.

### Opening a PR

- **Target branch: `develop`** (never open PRs directly to `main`)
- PR title: same format as commit message
- Link to the GDD spec section your work implements or affects
- CI will run typecheck + tests automatically — all checks must pass

---

## Release Process

### develop → main

When `develop` has accumulated enough changes to warrant a release:

1. **Bump the version** in `package.json` (use [semver](https://semver.org/)):
   - `patch` (0.0.x) — bug fixes, content additions
   - `minor` (0.x.0) — new gameplay features, new systems
   - `major` (x.0.0) — breaking changes, major milestones (e.g. full Act 1 complete)

2. **Open a PR from `develop` to `main`**
   - Title: `release: vX.Y.Z`
   - Describe what changed (CI will also auto-generate release notes from commits)

3. **CI runs** — all tests must pass before merge is permitted

4. **Merge the PR** — this triggers the release workflow automatically:
   - Reads version from `package.json`
   - Creates git tag `vX.Y.Z`
   - Creates a GitHub Release with auto-generated notes
   - Builds and deploys to GitHub Pages

**No manual tagging. No manual deploys. The version in `package.json` is the single source of truth.**

---

## CI/CD Pipelines

### `.github/workflows/ci.yml` — runs on every PR

Triggered by: PRs targeting `develop` or `main`

| Job | What it does |
|---|---|
| `typecheck` | `tsc --noEmit` — no TypeScript errors |
| `test` | `vitest run` — all unit + integration tests pass |

Both jobs must pass. PRs cannot be merged with failing CI.

### `.github/workflows/release.yml` — runs on merge to `main`

Triggered by: push to `main`

| Job | What it does |
|---|---|
| `typecheck-and-test` | Full test suite one final time |
| `tag-and-release` | Creates git tag + GitHub Release from `package.json` version |
| `build-and-deploy` | Vite build → GitHub Pages |

---

## Testing Standards

All systems must have spec-compliance tests. Test names cite the GDD section they verify:

```typescript
describe('[GDD §1.2] Daily insight cap', () => {
  it('applies 60% diminishing returns after 150 insight per loop', ...)
})
```

See [Testing Guide](./docs/TESTING.md) for the full testing strategy.

---

## Architecture Rules

The `src/interfaces/` directory contains the stable module contracts.

**These interfaces are governed — do not change them without discussion:**
- Breaking changes to any `I*.ts` file require a PR description explaining the impact
- All modules communicate via `IEventBus` — no direct cross-module imports
- New providers (audio, renderer) must implement the existing interface, not extend it

See [Architecture Guide](./docs/ARCHITECTURE.md) for full details.
