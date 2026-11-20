# 0004: NestJS replaces Hono

**Decision.** The API is NestJS on Express with nestjs-zod (zod 4) and @nestjs/swagger,
under the global prefix `/api`. Hono is removed.

**Why.** PRD 2.2 wants structure for a growing API (modules, guards, filters, DI) and
Better Auth mounts in it later. Express, not Fastify: Better Auth's Fastify adapter is beta
and Better Auth needs Nest's body parser off. Nest 11, not 12: nestjs-zod 5.6 and
@nestjs/swagger accept 10/11 only. Core stays framework-free; controllers are thin.

**Consequences.** Decorator metadata is not emitted (tsx, Vitest and the spec export all
use transpilers without it), so providers are injected by explicit `@Inject()` tokens and
bodies are validated by core, not by a pipe on a typed parameter. Spec schemas for
responses get an `_Output` suffix (nestjs-zod's input/output split). The spec is built
without a database; `getDb()` is lazy.
