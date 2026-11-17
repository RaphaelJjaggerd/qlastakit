# potato-eng notes

Friction, bugs and ideas for potato-eng found while building this kit.
One entry per finding: date, what happened, suggested fix.

## 2026-11-17: setup on an existing repo

- `AGENTS.md` and `CLAUDE.md` already existed. Setup says to skip existing files but also
  to fill the tier into `AGENTS.md`, and the scripts read `Tier:` from it. Merged the
  tier and working-method section into the existing file instead. Fix: say "merge the
  Tier line and Working method section into an existing AGENTS.md".
- The repo kept ADRs in `docs/decisions/`; `/decide` and `/prd` hardcode `docs/adr/`.
  Moved the folder. Fix: setup should detect an existing ADR folder and ask.
- `docs/REFERENCES.md` existed in a free-form shape without Path/Mode blocks, so `/vet`
  had nothing to read. Appended blocks. Fix: setup should check for the block shape.
- The scout model only lives in `~/.claude/agents/scout.md`, shared by every repo. A
  per-project model needed a project copy in `.claude/agents/scout.md`. Fix: let
  `models.env` name the scout, or have setup write the project copy.
- `verify.sh` template has no answer for "no tests yet"; this repo skips the test step
  until a root `test` script exists and says SKIPPED.
