# ui-kit  (vetted 2026-11-20, mode reuse)

## Summary
Raphael's own React Router 7 + Vite + Tailwind 4 + Base UI project, already tokenized.
The token file and the 27 UI primitives are clean: no router, axios, zustand or
palette colours, one icon set (`@tabler/icons-react`), colours, shadows and motion all
come from tokens in `theme.css`. The shell, guards, routes, auth and mock API are the
parts PRD §3.4 replaces. Nothing needs an owner decision.

Not run: the reference has no tests, and nothing under `references/` is installed or
built (AGENTS.md rule). Verdicts come from reading. Not every long class string in
`checkbox`, `radio-group`, `select`, `dropdown-menu`, `input`, `textarea`, `tabs` and
`sheet` was read line by line; 1.2 and 1.4 get the real proof from the token-purity check.

## Files
| File | Verdict | Notes |
| --- | --- | --- |
| `src/theme.css` | fix | F1, F2 |
| `theme.css` (root) | reject | Duplicate of `src/theme.css`, see F1 |
| `DESIGN.md` | fix | F3 |
| `component-inventory.md` | fix | F3 |
| `src/index.css` | keep | Tailwind, `tw-animate-css`, `shadcn/tailwind.css`, font, `theme.css`. Adaptation A1 |
| `src/shared/utils/cn.ts` | keep | `extendTailwindMerge` lists every shadow, font, ease, text and duration token. A new shadow, font, ease or duration token must be added to this list too (F4 adds some) |
| `src/components/shared/ui/{alert,avatar,badge,button,card,collapsible,field,input,input-group,label,pagination,radio-group,skeleton,spinner,switch,table,tabs,textarea,tooltip,checkbox,dropdown-menu,select}.tsx` | keep | Adaptation A2, A3 only |
| `ui/separator.tsx` | fix | F4 |
| `ui/sidebar.tsx` | fix | F4, F5 |
| `ui/sheet.tsx` | keep | Adaptation A2, A3 |
| `ui/icon-tile.tsx`, `ui/setting-row.tsx` | keep | The custom components. Tokens only |
| `src/shared/hooks/use-mobile.ts` | keep | Effect-only, SSR safe (false on the server) |
| `src/components/shared/logo.tsx` | fix | F6 |
| `src/components/shared/container.tsx`, `header.tsx` | fix | F7 |
| `src/components/shared/authority-check.tsx`, `src/shared/hooks/use-authority.ts` | fix | F8 |
| `src/components/shared/navigation/*` | fix | F9 |
| `src/components/layouts/**` (app-layout variants, auth-layout, layout-base, layouts.tsx) | fix | F10 |
| `src/components/route/*` | reject | Redirect-after-render guards and a central lazy routes array. PRD §3.4 and §3.5. Rebuild in 1.5 as file routes with before-load |
| `src/shared/configs/app.config.ts` | reject | Mostly supastarter flags for features that do not exist (marketing, passkeys, magic link, contact form, org billing), `enableMock`, a `supastarter.dev` mail address. Keep only `appName`. Write a small config in 1.5 (PRD §3.4 "only flags the kit implements") |
| `src/shared/configs/navigation.config/*` | fix | F11 |
| `src/shared/configs/routes.config/*` | reject | Replaced by file routes (1.5) |
| `src/shared/configs/{endpoint,firebase}.config.ts` | reject | axios and firebase leftovers |
| `src/shared/constants/*` | fix | F12 |
| `src/shared/@types/*` | fix | Keep `navigation.ts`, `common.tsx`; drop `auth.ts`, `routes.tsx` with their consumers |
| `src/shared/hooks/{use-layout,use-menu-active,use-auth}.ts`, `src/shared/store/*` | reject | Layout and route-key stores, zustand auth store (PRD §3.4 table) |
| `src/shared/providers/**`, `src/shared/services/**` | reject | Auth provider and axios API service |
| `src/lib/axios/*`, `src/lib/mock/**` | reject | Mock API, axios (PRD §3.5, verified absent by 2.4c) |
| `src/lib/locales/**` | fix | F13 |
| `src/app/pages/components/index.tsx` | fix | F14 |
| `src/app/pages/auth/{sign-in,sign-up,forgot-password,reset-password}.tsx`, `src/app/features/auth/components/*` | fix | Port the markup and classes; replace form submit and routing (1.5, 2.4a, 2.4c). Sub-folder `index.ts` files are plain re-exports |
| `src/app/features/auth/services/*`, `src/app/pages/auth/otp-verification.tsx`, `src/app/features/roles-permissions/*`, `src/app/pages/account/roles-permissions.tsx` | reject | Mock auth; screens with no v1 feature (PRD §3.5) |
| `src/app/pages/account/settings.tsx`, `src/app/features/settings/*` | fix | Keep profile, security, billing sections (PRD §3.4); drop notifications and integrations (PRD §3.5) |
| `src/app/pages/home/index.tsx` | fix | Stub landing; take the markup only if 1.5 needs a home screen |
| `src/app/pages/documentation/*`, activity log and pricing stub pages | reject | Stub pages (PRD §3.5). Pricing is rebuilt in 3.2 |
| `src/App.tsx`, `src/main.tsx` | reject | React Router, mock boot. TanStack Start has its own entry |
| `package.json`, `vite.config.ts`, `eslint.config.js`, `.prettierrc`, `components.json` | reject | We use pnpm workspace, oxlint, oxfmt. Take the dependency list from the Adaptation section |
| `CLAUDE.md`, `.ai/**`, `README.md`, `react-starter-nue-tactile.zip` | reject | Source for the web agent guide (1.7) only; the zip is a duplicate |

## Fixes
- F1 `src/theme.css` vs root `theme.css`: two copies, not byte-compared (the scout counted 291 lines for each, the `src/` copy read here has 325). `src/index.css` imports `src/theme.css`, so that one is canonical. -> 1.2 takes `src/theme.css` only, never the root copy; 1.2 should diff the two and log any difference.
- F2 `src/theme.css:97` (`--font-family: 'Instrument Sans Variable'`) needs the `@fontsource-variable/instrument-sans` import that lives in `index.css`. -> Move that import into the UI package's CSS entry, so every app gets the font with the theme.
- F3 `DESIGN.md`, `component-inventory.md`, `CLAUDE.md`: they name `@/` and `@components/*` aliases, `npm run`, `docs/component-inventory.md` (the file is at the root) and the react-router config recipes. -> The UI package's DESIGN.md keeps the token rules and component list; imports become `@qlastakit/ui`; recipes move into the web app guide (1.7) per PRD §3.4 "prime directives".
- F4 `ui/separator.tsx:24`, `ui/sidebar.tsx:238,485`: `shadow-[...var(--etched-edge)]` and `shadow-[0_0_0_1px_var(--sidebar-border)]` are arbitrary shadows inside a component, against "never hardcode shadows" (DESIGN.md, PRD §3.4). They use tokens inside, but the 1.4 token-purity check will flag any `shadow-[`. -> Add tokens (`--etched-edge-shadow-x/-y`, `--sidebar-outline-shadow`) mapped to `shadow-etched-h`, `shadow-etched-v`, `shadow-sidebar-ring`, add each to `cn.ts`'s shadow list, and use them. Same for `shadow-[inset…color-mix…]` in `navigation/app-stacked-side-nav.tsx` and `shadow-[0_1px_0_0_var(--etched-edge)]` in `navigation/inset-header.tsx` (F9).
- F5 `ui/sidebar.tsx:1` `"use client"` is a Next.js directive with no meaning in TanStack Start. -> Delete the line. The sidebar's cookie write (`:86`) runs only in a handler, so it is SSR safe; it does not read the cookie back, so the open state is not restored on load (leave, log).
- F6 `shared/logo.tsx`: reads the app name from `@configs/app.config` (`'Next Start Redo'`). -> Take the name as a prop (or a translation key) so the UI package imports nothing from an app.
- F7 `shared/header.tsx`: the middle slot has conflicting `flex … hidden md:flex` display classes, and it imports a `HEADER_HEIGHT` constant from the app constants. -> Drop `flex` from the middle slot; pass the height as a prop or a CSS variable. `container.tsx` imports `CommonProps` and a config; type its props inline.
- F8 `authority-check.tsx`, `use-authority.ts`: read roles from the zustand auth store. -> Rebuild on the Better Auth session and org roles (owner, admin, member) in 2.7; stub it in 1.5 behind the same `authority` prop.
- F9 `shared/navigation/*`: `app-top-nav.tsx` and `app-side-nav.tsx` hardcode two different users ("Alex Rock", "Jordyn Levin"; one with `avatar-01.png`), the Log out item has no handler, `app-side-nav.tsx` logo is a plain `<a href>`, and they import react-router `Link`, `auth-store` and `route-key-store`. -> Keep structure, markup and classes; take the user from the session, the current route from the matched route (PRD §3.4), links from TanStack Router `Link`, and wire Log out to Better Auth sign-out. Navigation icon map is Tabler-only; keep.
- F10 `layouts/**`: `layouts.tsx` picks the layout from a zustand store and `useAuth` (the effect-writes-store defect, PRD §3.5). Six variants plus `blank`; three auth layouts (simple, split, side). -> 1.5 derives the layout during render from the matched route, else the config default. Keep the variant markup unchanged; port only variants the default theme needs and note any not moved.
- F11 `navigation.config/index.ts`: titles are plain strings plus `translateKey`; one tree drives every nav surface (kept per PRD §3.4). -> Make `translateKey` the only title (1.6) and drop the role constants (`ADMIN`, `USER`) for `authority: ("owner"|"admin"|"member")[]`.
- F12 `shared/constants/*`: `roles.constant.ts` (admin/user), `api.constant.ts` (axios), `route.constant.ts` (central routes). -> Keep `navigation.constant.ts` and the theme enum; drop the rest.
- F13 `lib/locales/*`: a single `en.json`, i18next wiring written for the app. -> 1.6 builds the i18n setup (PRD §2.4); reuse the key names from `en.json` where the screens use them.
- F14 `app/pages/components/index.tsx`: imports from `@/components/shared/ui/*` and `@/shared/utils/index`; one `Logo` import. It has no router imports. -> Becomes the dev-only preview route (1.3); change the imports to `@qlastakit/ui`, gate it to dev. It mentions shadow classes 13 times; the 1.4 check decides which are legitimate demos.

## Adaptation
- A1 Import alias: every UI file uses `@/shared/utils/index` and `@/components/shared/ui/<x>`. In `@qlastakit/ui` use relative imports inside the package (`../lib/cn`) and the package name outside. One alias in the web app (PRD §3.5).
- A2 Dependencies the UI package needs: `@base-ui/react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `@tabler/icons-react`, `tw-animate-css`, `shadcn` (only for `shadcn/tailwind.css`), `@fontsource-variable/instrument-sans`, `tailwindcss` (peer). Take versions from the reference `package.json` unless the workspace pins newer. One icon dependency (PRD §3.5 check).
- A3 `cn`: `shared/utils/cn.ts` moves with the components; the other utils (`cookies-storage`, `sleep`, `wild-card-search`) do not.
- A4 Package name `klastafak-react-starter` and the "Next Start Redo" app name do not carry over.
- A5 The UI package has no tests today; the preview page and the 1.4 token-purity check are its proof.

## Tests
None in the reference (no `*.test.*` or `*.spec.*` files). Nothing was run. 0.2's Testing Library harness covers the web app; 1.4 adds the throwaway-theme test and 1.5 the render-order tests (PRD §3.5).

## PRD cross-check
- PRD §3.4 says 24 UI components; the reference has 27 files in `ui/` (incl. `icon-tile`, `setting-row`, `sidebar`, `sheet`). Use the files, not the count.
- PRD §3.5 says shadows are applied "by a helper outside the components" and "two icon sets installed". Neither was found: no such helper under `src/`, and `package.json` has only `@tabler/icons-react`. The remaining shadow impurity is the arbitrary `shadow-[...]` classes in F4. 1.4 and 1.2 should still run their checks.
- PRD §3.4 says "About 20 files depend on React Router or the mock auth". Consistent with the reject and fix rows above.
