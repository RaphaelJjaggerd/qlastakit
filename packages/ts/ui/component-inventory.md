# Component inventory

Every component in the kit and what it is built on. Rules for using them are in
[`DESIGN.md`](./DESIGN.md). Live preview: a dev-only route in the web app (card 1.3).
Only the UI primitives below live in this package (card 1.2); shared components,
navigation and layouts are rebuilt in the web app in card 1.5 and are listed here for
reference.

Status key:

- **shadcn, theme only**: stock shadcn file, styled by tokens alone
- **shadcn, edited**: shadcn file with Tactile edits (listed)
- **custom**: not in shadcn

## UI primitives (`src/components`)

| Component | Status | What was changed |
| --- | --- | --- |
| Alert | shadcn, edited | Added. Tinted `destructive`, `success`, `warning` variants |
| Avatar | shadcn, theme only | |
| Badge | shadcn, edited | Added `success` and `warning` variants |
| Button | shadcn, edited | `default` is raised, `secondary` is the flat solid fill, extra `tertiary` variant. Default 40px, `lg` 44px |
| Card | shadcn, edited | Tactile by default (gradient + float shadow, no ring). `glow` prop |
| Checkbox | shadcn, edited | `shadow-subtle` |
| Collapsible | shadcn, theme only | |
| Dropdown menu | shadcn, edited | `shadow-popover`, `duration-fast` |
| Field | shadcn, theme only | Not used by a page yet. Use it for new forms |
| Input | shadcn, edited | Recessed. 40px |
| Input group | shadcn, edited | Recessed. 40px. Used for the search field |
| Label | shadcn, theme only | |
| Pagination | shadcn, edited | 40px items |
| Radio group | shadcn, theme only | |
| Select | shadcn, edited | Recessed trigger, 40px. Popup uses `shadow-popover`, `duration-fast` |
| Separator | shadcn, edited | `variant="etched"`, horizontal and vertical |
| Sheet | shadcn, edited | `shadow-popover`, `duration-slow`, token overlay |
| Sidebar | shadcn, edited | Sidebar surface + gradient, etched edge, inset variant and motion now live in the component (they were CSS overrides in `index.css`) |
| Skeleton | shadcn, theme only | |
| Spinner | shadcn, theme only | |
| Switch | shadcn, edited | Tactile toggle (recessed track, raised thumb) on switch tokens |
| Table | shadcn, edited | `TableHead` uses the overline style |
| Tabs | shadcn, edited | `shadow-subtle` on the active tab. Not used by a page yet |
| Textarea | shadcn, edited | Recessed |
| Tooltip | shadcn, theme only | |
| Icon tile | custom | Monochrome icon square or circle. Tones `muted`, `primary`, `outline` |
| Setting row | custom | Media + title + description + trailing action |

## Shared components: not moved yet (1.5)

In the reference kit under src/components/shared. Card 1.5 rebuilds them in the web app.

| Component | Status | Notes |
| --- | --- | --- |
| Logo | custom | The single brand mark. Name from `app.config`. `tone="rail"` for the icon rail |
| Header, InsetHeader | custom, shell | Styling reads tokens. Will be rewritten for TanStack Router |
| Footer, Container, PageContainer | custom, shell | Same |
| Loading | custom, shell | Same |
| NavUser | custom, shell | Same. Uses mock user data |
| AuthorityCheck | custom, shell | No styling |

## Navigation: not moved yet (1.5)

In the reference kit under src/components/shared/navigation. Card 1.5 rebuilds them in the
web app.

| Component | Status | Notes |
| --- | --- | --- |
| AppSideNav | custom, shell | Uses Sidebar |
| AppStackedSideNav | custom, shell | The dark icon rail + secondary panel. Rail tokens |
| AppTopNav | custom, shell | |
| VerticalMenuContent, VerticalMenuIcon | custom, shell | Tabler icons |
| HorizontalMenuContent | custom, shell | Tabler icons |

## Layouts: not moved yet (1.5)

In the reference kit under src/components/layouts. Card 1.5 rebuilds them in the web app.

| Component | Status | Notes |
| --- | --- | --- |
| App layouts: collapsible-side, floating-side, frameless-side, stacked-side, top-bar, blank | custom, shell | Styling reads tokens (`bg-panel`, `surface-gradient`, etched edge). Structure untouched |
| Auth layouts: simple, split, side | custom, shell | Same |

## Theme utilities (`src/theme.css`)

| Utility | Purpose |
| --- | --- |
| `title-display`, `title-page`, `title-section`, `title-row`, `label-overline` | Type styles |
| `surface-gradient`, `surface-panel`, `glow` | Tactile surfaces |
| `shadow-raised`, `shadow-recessed`, `shadow-card`, `shadow-popover`, `shadow-subtle`, `shadow-etched-h`, `shadow-etched-v`, `shadow-sidebar-ring`, `shadow-sidebar-ring-hover` | Shadows |
| `duration-fast`, `duration-slow`, `ease-sidebar` | Motion |

## Not part of the system

- Card network marks in the billing demo (fixed brand colours)
- Mock API and mock user data (to be deleted)
