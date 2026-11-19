#!/usr/bin/env bash
# PreToolUse hook: blocks destructive commands so unattended runs cannot push,
# hard-reset, clean or delete branches, or delete folders. Exit 2 = block.
# Single-file `rm` is allowed; recursive `rm` (-r, -R, -rf, -fr, --recursive) is
# not. `git rm -r` is allowed: it only removes tracked files, which git keeps.
input=$(cat)
cmd=$(printf '%s' "$input" | sed -n 's/.*"command":"\(.*\)".*/\1/p' | head -1)
[ -z "$cmd" ] && cmd=$input
if printf '%s' "$cmd" | grep -qE 'git[[:space:]]+(push|reset[[:space:]]+--hard|clean[[:space:]]+-[a-zA-Z]*f|branch[[:space:]]+-D|checkout[[:space:]]+\.|restore[[:space:]]+\.)'; then
  echo "BLOCKED by potato-eng: destructive git command. A human runs these." >&2
  exit 2
fi
# Drop `git rm` first so its -r is not mistaken for a recursive rm.
plain=$(printf '%s' "$cmd" | sed -E 's/git[[:space:]]+rm/git-rm/g')
if printf '%s' "$plain" | grep -qE '(^|[^[:alnum:]_.-])rm[[:space:]]([^;&|]*[[:space:]])?(-[a-zA-Z]*[rR][a-zA-Z]*|--recursive)([[:space:]]|$)'; then
  echo "BLOCKED by potato-eng: recursive rm. Delete single files with rm, or ask a human." >&2
  exit 2
fi
exit 0
