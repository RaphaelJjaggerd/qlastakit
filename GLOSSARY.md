# Glossary

Terms this project uses, one line each, no implementation detail. Written
by /grill as terms settle; read by every command. Challenge a word that
conflicts with a line here.

**Kit**: qlastakit, the repo every project is copied from.
**Project**: a repo copied from the kit to build one product.
**Idea app**: the first project built from the kit, in its own repo, after v1. Never built in the kit repo.
**App**: something a user opens (`apps/`).
**Service**: a backend program reached over HTTP through the contract (`services/`).
**Module**: one capability the kit ships (email, payments, storage, jobs, AI, i18n).
**Org**: the tenant that owns every row of data.
**Personal org**: the org every user gets automatically at signup.
**Reference deploy**: the kit's own live deploy, where every kit feature works end to end. v1 is done when it does.
**Reference feature**: `notes`, the small feature new features copy their shape from.
**Theme**: a named set of token values under `[data-theme="name"]`. Changing theme never edits a component.
**Tactile**: the default theme, the kit's current look.
**Full shape**: a project whose apps call the NestJS API through the generated client.
**Light shape**: a project whose web app calls core directly from server functions, with no API service.
