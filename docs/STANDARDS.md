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

- A log line, comment or test header claims only what the code does and the test proves
  (0.4b logged error mappings that never fired; 0.5 said "through the running app" for a
  fake-host test).
- A test name says what it asserts; a test that only sets up state for the next one is named
  for that and asserts the setup worked.
- After moving or renaming a path, URL, env var or script, sweep the whole committed tree
  for the old name before closing, not just the lines a reviewer cites.
- A lint or verify ban is proved with a probe for every form the repo really uses (extension,
  alias, relative path), not one (0.4b: `../../db` was banned, `../../db.ts` was not).
- A card that reuses a reference file diffs it against the reference before closing and logs
  every difference with its reason (1.2 and 1.10 were each returned for unlogged differences).
- A runtime criterion that says "renders" exercises everything that mounts on interaction
  (1.3: the page loaded, the dropdown crashed on open).
- A test of order or timing uses a path that cannot reach the asserted result another way
  (1.5: effects had already run before the layout assertion; 1.6: a title test that a literal
  string would still pass).

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
