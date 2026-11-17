#!/usr/bin/env bash
# potato-eng loop: /task (builder) -> /review (checker) -> after two
# returns, /advise (advisor) -> repeat, each in a fresh claude process,
# until docs/TASKS.md has no todo.
#
# Stops when: a claude process exits non-zero; a card is blocked or
# in-progress; the first card has not changed for MAX_SAME iterations;
# or MAX_TASKS iterations ran.
#
# Models come from scripts/models.env (TASK_MODEL, REVIEW_MODEL,
# ADVISOR_MODEL). Tier comes from AGENTS.md ("Tier: jam|full"); jam skips
# review and advise. CLAUDE_ARGS adds flags, e.g. a permission mode.
set -euo pipefail
cd "$(dirname "$0")/.."
# Git Bash on Windows rewrites "/task" into a path; stop it.
export MSYS_NO_PATHCONV=1

TASKS=docs/TASKS.md
MAX_SAME=${MAX_SAME:-4}
MAX_TASKS=${MAX_TASKS:-50}
# shellcheck disable=SC1091
[ -f scripts/models.env ] && . scripts/models.env
TIER=$(grep -m1 -E '^Tier:' AGENTS.md 2>/dev/null | awk '{print $2}'); TIER=${TIER:-full}

run() { # run <command> <model>
  local flags=(); [ -n "${2:-}" ] && flags=(--model "$2")
  # shellcheck disable=SC2086
  claude -p "$1" "${flags[@]}" ${CLAUDE_ARGS:-}
}
first_todo_block() { awk 'function flush(){ if (blk ~ /\n- Status: todo/) { print blk; exit } } /^## /{flush(); blk=$0; next} {blk=blk "\n" $0} END{flush()}' "$TASKS"; }
first_todo()  { first_todo_block | head -1 | sed 's/^## //'; }
retries()     { first_todo_block | grep -m1 -E '^- Retries:' | awk '{print $3}'; }
stuck()       { grep -qE '^- Status: (blocked|in-progress)' "$TASKS"; }

same=0; prev=""; n=0
while :; do
  stuck && { echo "A card is blocked or in-progress. Stopping."; exit 1; }
  card=$(first_todo); [ -z "$card" ] && { echo "No todo left."; exit 0; }
  if [ "$card" = "$prev" ]; then same=$((same+1)); else same=0; fi
  [ "$same" -ge "$MAX_SAME" ] && { echo "'$card' has not moved in $MAX_SAME iterations. Stopping."; exit 1; }
  prev=$card; n=$((n+1))
  [ "$n" -gt "$MAX_TASKS" ] && { echo "Reached MAX_TASKS=$MAX_TASKS. Stopping."; exit 0; }

  echo "==> task ($TIER): $card"
  run "/task" "${TASK_MODEL:-}" || { echo "task exited non-zero. Stopping."; exit 1; }
  stuck && { echo "Task left a card blocked. Stopping."; exit 1; }
  [ "$TIER" = "jam" ] && continue

  echo "==> review: $card"
  run "/review" "${REVIEW_MODEL:-}" || { echo "review exited non-zero. Stopping."; exit 1; }

  if [ "$(first_todo)" = "$card" ] && [ "${r:=$(retries)}" -ge 2 ] 2>/dev/null; then
    echo "==> advise (returned $r times): $card"
    run "/advise" "${ADVISOR_MODEL:-}" || { echo "advise exited non-zero. Stopping."; exit 1; }
  fi
  unset r
done
