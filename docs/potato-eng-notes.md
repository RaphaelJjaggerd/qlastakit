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

## 2026-11-18: PRD review rounds

- `prd-review.sh` ends by grepping every `[owner]` line ever written, so answered
  questions from earlier rounds are listed as open. Fix: list only `[owner]` lines from
  the last reviewer round, or skip ones an owner-answers block marks settled.
- The loop only stops on `must: 0`, but an author round always follows the reviewer, so
  a run that hits the round cap ends with musts applied and never re-checked. Fix: end
  with a reviewer round, or report "musts applied, unconfirmed".
- Must counts per round: 5, 1, 1, 1, 2. Each round finds a few new real issues on a
  ~700-line PRD; there is no stopping rule for diminishing returns besides the cap.

## 2026-11-18: first run-tasks.sh run

- A bare `scripts/run-tasks.sh` with no allow list burned eight sessions (four `/task`,
  four `/review`) doing nothing: every `/task` was denied its first edit and ended with
  the card still `todo`, every `/review` found nothing done, and the loop stopped only on
  `MAX_SAME=4`. Fix: stop as soon as a `/task` session ends with the first card still
  `todo` and nothing changed (same `HEAD`, clean tree), and skip `/review` when `/task`
  committed nothing.
- `run-tasks.sh` runs headless, so any command missing from the allow list is denied
  with no prompt and the card stalls silently; the denial shows only in the session's
  prose. Fix: detect a permission denial (e.g. run `claude -p` with
  `--output-format stream-json` and look for denied tool results, or check the exit
  report) and stop with a clear message naming the denied tool and command, so the
  owner adds that one rule. Setup should also write a starting allow list into
  `.claude/settings.json` for the stack's commands.
