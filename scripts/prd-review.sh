#!/usr/bin/env bash
# Alternates reviewer and author sessions on docs/PRD.md until a reviewer
# round reports must: 0 with nothing disputed, or MAX_ROUNDS is reached.
# Then prints the open [owner] questions for the human.
#
# CLAUDE_ARGS: extra flags, e.g. a permission mode. MAX_ROUNDS default 4.
# Run /grill interactively first; this script runs only the unattended
# reviewer (advisor model) / author (builder model) rounds.
set -euo pipefail
cd "$(dirname "$0")/.."
# Git Bash on Windows rewrites "/task" into a path; stop it.
export MSYS_NO_PATHCONV=1
# shellcheck disable=SC1091
[ -f scripts/models.env ] && . scripts/models.env
TIER=$(grep -m1 -E '^Tier:' AGENTS.md 2>/dev/null | awk '{print $2}'); TIER=${TIER:-full}
[ "$TIER" = "jam" ] && { echo "Tier jam: PRD review rounds are skipped. Run /grill, then /tasks."; exit 0; }
run() { local f=(); [ -n "${2:-}" ] && f=(--model "$2"); claude -p "$1" "${f[@]}" ${CLAUDE_ARGS:-}; }
LOG=docs/PRD_REVIEW.md
MAX=${MAX_ROUNDS:-4}

last_round() { awk '/^## Round/{s=""} {s=s $0 "\n"} END{printf "%s", s}' "$LOG" 2>/dev/null || true; }

for ((r=1; r<=MAX; r++)); do
  echo "==> round $r: reviewer"
  run "/prd-review reviewer" "${ADVISOR_MODEL:-}"
  summary=$(last_round | grep -E '^must: ' || echo "must: ?")
  echo "    $summary"
  if last_round | grep -q '^must: 0' && ! grep -q '\[disputed\]' "$LOG"; then
    echo "PRD converged after $r round(s)."; break
  fi
  echo "==> round $r: author"
  run "/prd-review author" "${TASK_MODEL:-}"
done

echo
echo "Questions for the owner (answer these in docs/PRD.md before generating tasks):"
grep -n '\[owner\]' "$LOG" || echo "  none"
