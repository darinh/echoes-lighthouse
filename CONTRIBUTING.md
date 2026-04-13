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

**Commit type → version bump (automatic on merge to main):**

| Type | Bump | Example |
|---|---|---|
| `feat:` | minor `0.x.0` | New gameplay system, new UI panel |
| `fix:` `perf:` | patch `0.0.x` | Bug fix, performance improvement |
| `feat!:` or `BREAKING CHANGE:` footer | major `x.0.0` | Incompatible interface change |
| `chore:` `docs:` `test:` `refactor:` `content:` | **none** | No release triggered |

You never touch `package.json` version manually. The release workflow reads commit messages since the last tag and determines the bump automatically.

### Opening a PR

- **Target branch: `develop`** (never open PRs directly to `main`)
- PR title: same format as commit message
- Link to the GDD spec section your work implements or affects
- CI will run typecheck + tests automatically — all checks must pass

---

## Release Process

### develop → main

When `develop` has accumulated enough changes to warrant a release:

1. **Open a PR from `develop` to `main`** — no version bump needed, ever
   - Title follows conventional commit format, e.g. `feat: complete Act 1 content`
   - CI runs typecheck + tests — all must pass before merge is permitted

2. **Merge the PR** — the release workflow runs automatically:
   - Reads all commits since the last tag
   - Determines version bump from commit types
   - Creates git tag `vX.Y.Z`
   - Creates GitHub Release with auto-generated changelog
   - Builds and deploys to GitHub Pages

**You never manually bump the version. The commit messages are the version.**

#### Version bump rules

| Commits since last release contain... | Result |
|---|---|
| Any `feat:` commit | minor bump `0.x.0` |
| Only `fix:` / `perf:` commits | patch bump `0.0.x` |
| Any `feat!:` or `BREAKING CHANGE:` footer | major bump `x.0.0` |
| Only `chore:` `docs:` `test:` `refactor:` `content:` | **no release created** |

#### Signalling a breaking change

```
feat!: redesign ISystem interface

BREAKING CHANGE: ISystem.onEvent signature changed — all systems must update.
```

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
| `tag-and-release` | Determines bump from commits → creates tag + GitHub Release |
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
