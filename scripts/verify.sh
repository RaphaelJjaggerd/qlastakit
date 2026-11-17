#!/usr/bin/env bash
# Project verification for qlastakit: typecheck, lint, tests, contract drift.
# Calls the root pnpm scripts, so it survives the Phase 0 swaps (Biome to
# oxlint + oxfmt, just to mise): those change what `pnpm lint` runs, not this.
#   - exits non-zero on any failure
#   - full output goes to Logs/, only errors and a one-line summary print
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p Logs

command -v pnpm >/dev/null || { echo "verify: pnpm not found (mise install)"; exit 1; }
[ -d node_modules ] || { echo "verify: no node_modules, run pnpm install"; exit 1; }

run() {
  local name=$1; shift
  if "$@" > "Logs/$name.log" 2>&1; then
    echo "$name: ok"
  else
    echo "$name: FAILED (Logs/$name.log)"
    grep -iE 'error|fail' "Logs/$name.log" | grep -v ELIFECYCLE | head -40 || tail -20 "Logs/$name.log"
    exit 1
  fi
}

run typecheck pnpm typecheck
run lint      pnpm lint

# No tests exist yet; the Phase 0 test-harness card adds a root "test" script.
if grep -qE '"test"[[:space:]]*:' package.json; then
  run test pnpm test
else
  echo "test: SKIPPED (no root test script yet)"
fi

# Golden rule 4: routes changed means the contract must be regenerated.
# Regenerate and fail if that changed anything under contracts/.
before=$({ git diff -- contracts; git status --porcelain -- contracts; } 2>/dev/null | git hash-object --stdin)
run contract pnpm contract
after=$({ git diff -- contracts; git status --porcelain -- contracts; } 2>/dev/null | git hash-object --stdin)
if [ "$before" != "$after" ]; then
  echo "contract: FAILED, contracts/ was stale. It is regenerated now; review and commit it."
  exit 1
fi
echo "contract: up to date"

echo "verify: all passed"
