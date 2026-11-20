#!/usr/bin/env bash
# Project verification for qlastakit: typecheck, lint, tests, contract drift.
# Calls the root pnpm scripts, so tooling swaps change what `pnpm lint` runs, not this.
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

# PRD 3.5: one icon set. Tabler only; any other icon dependency fails.
icons=$(git ls-files '*package.json' | xargs grep -nE '"(lucide[a-z-]*|react-icons|@heroicons/[a-z-]+|@phosphor-icons/[a-z-]+|@radix-ui/react-icons|@fortawesome/[a-z-]+|@mui/icons-material|@remixicon/[a-z-]+|remixicon|iconoir-react|feather-icons|react-feather|@iconify/[a-z-]+)"[[:space:]]*:' || true)
if [ -n "$icons" ]; then
  echo "icons: FAILED, a second icon dependency (only @tabler/icons-react is allowed):"
  echo "$icons"
  exit 1
fi
echo "icons: one icon set"

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
