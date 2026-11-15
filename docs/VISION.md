# Vision: from qlastakit to Qlastabase

Context for decisions in the kit. Nothing here is scheduled. Each stage gets its own
PRD when the stage before it is in real use.

## The idea

Every way of creating a project writes the same small manifest, and one engine turns
that manifest into a project.

```json
// qlastakit.json
{
  "name": "my-app",
  "apps": ["web", "mobile"],
  "api": "nestjs",
  "modules": ["auth", "payments:stripe", "email"]
}
```

## Stages

1. **qlastakit v1** (see `docs/PRD.md`). The kit, proven by 2 or 3 real projects.
2. **Engine + CLI.** Lives in this repo. Templates are extracted from the kit:
   a base plus additive modules, each with a small `module.json` (dependencies, env
   vars, migrations, tasks, an AGENTS.md section). `npx create-qlastakit` asks
   questions, writes the manifest, calls the engine. Generated projects keep their
   `qlastakit.json` so `add <module>` works later.
3. **Web GUI.** A form that builds the manifest, like better-t-stack's builder.
4. **Qlastabase builder.** A separate repo. Chat UI where the AI calls the engine as
   tools and writes only business logic, following the generated `AGENTS.md`. Projects
   run in a sandbox for live preview. More structured than bolt.new or Lovable because
   output starts from tested modules.
5. **Qlastabase platform.** Hosting, managed Postgres, logs, monitoring, domains.
   Starts as a wrapper over existing infrastructure (Coolify, Fly or Railway).
   Running our own infrastructure comes last.

## What this means for the kit today

- Modules stay additive and self-contained, so they can become templates later.
- Every app and service ships a Dockerfile, the unit Qlastabase will host.
- `AGENTS.md` and the recipes are part of the product, not documentation on the side.
- Nothing in the kit may assume it is the only project in the world: no hardcoded
  names, domains or secrets.
