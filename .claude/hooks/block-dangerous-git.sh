#!/usr/bin/env bash
# PreToolUse hook: blocks destructive git commands so unattended runs cannot
# push, hard-reset, clean or delete branches. Exit 2 = block.
input=$(cat)
cmd=$(printf '%s' "$input" | sed -n 's/.*"command":"\(.*\)".*/\1/p' | head -1)
[ -z "$cmd" ] && cmd=$input
if printf '%s' "$cmd" | grep -qE 'git[[:space:]]+(push|reset[[:space:]]+--hard|clean[[:space:]]+-[a-zA-Z]*f|branch[[:space:]]+-D|checkout[[:space:]]+\.|restore[[:space:]]+\.)'; then
  echo "BLOCKED by potato-eng: destructive git command. A human runs these." >&2
  exit 2
fi
exit 0
