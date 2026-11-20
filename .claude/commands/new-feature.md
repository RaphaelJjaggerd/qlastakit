---
description: Add a feature end to end (migration, API, contract, UI)
argument-hint: <feature name and what it should do>
---

Add this feature: $ARGUMENTS

Follow `docs/recipes/add-feature.md` exactly, using notes as the reference: the logic in
`packages/ts/core/src/notes` and its thin API route in
`services/api/src/features/notes/routes.ts`. Ask me before inventing fields or behavior I
did not describe. Finish with `mise run contract` and `mise run check`, then summarize what
changed in a few lines.
