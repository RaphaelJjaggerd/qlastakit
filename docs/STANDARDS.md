# Standards

Read by `/review`, not by `/task`. The implementer has the most context
pressure; the reviewer has a diff and nothing else, so judgement lives here.

Two rules decide what goes in this file:

- A **mechanical** rule (a banned API, a naming pattern, a file location, a
  required parameter) does not belong here. It becomes a check in
  `scripts/verify.sh` (lint rule, analyzer, grep, test). The phase gate does
  that conversion.
- A **judgement call** (consistency with surrounding code, whether an
  abstraction earns its place) belongs here, one line each, with an example
  if the line alone is ambiguous.

## Project standards

<!-- Added by the phase gate from repeated review findings. One line each. -->

## Smell baseline

Applies even when the list above is empty. Every item is a judgement call,
labelled "possible", never a hard violation. A project standard above wins
where they disagree.

- **Speculative generality**: a parameter, hook, interface or abstraction
  for a need the card did not have. Delete it; inline until a real need shows.
- **Duplicated code**: the same shape in two places in the diff. Extract once.
- **Mysterious name**: a name that does not say what the thing does or holds.
  Rename; if no honest name comes, the design is murky.
- **Shotgun surgery**: one logical change scattered across many files. Gather
  what changes together.
- **Middle man**: a class that mostly delegates. Cut it.
- **Primitive obsession**: a string or int standing in for a domain concept
  that deserves its own small type.
