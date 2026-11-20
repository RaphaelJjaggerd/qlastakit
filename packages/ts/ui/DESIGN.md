# DESIGN.md: the Tactile design system

Rules for anyone (human or AI agent) writing UI in this kit. The system is
shadcn/ui (base-vega style, Base UI primitives) on Tailwind v4, themed with the
"Tactile" look: soft raised buttons, recessed fields, etched dividers, floating
cards.

- Tokens: `src/theme.css` (the only place values live)
- Components: `src/components`, imported from `@qlastakit/ui`
- Preview: a dev-only route in the web app (card 1.3; every component, variant and state)
- Shadows that are not a token are never inlined: add a `--shadow-*` entry in
  `theme.css` and its name to `src/cn.ts`

## 1. The one rule

**Components never contain a colour, shadow, gradient or duration value.** They
use token-backed utilities only. A theme changes the look by changing token
values, with zero component edits.

Never write in a component or page:

| Not allowed | Use instead |
| --- | --- |
| `#fff`, `rgba(...)`, `oklch(...)` | a token utility (`bg-card`, `text-muted-foreground`) |
| Palette classes: `bg-gray-900`, `text-red-600`, `bg-white`, `text-black` | semantic tokens (`bg-primary`, `text-destructive`, `bg-background`) |
| `shadow-sm`, `shadow-md`, `shadow-[0_1px_2px_#0003]` | `shadow-raised`, `shadow-recessed`, `shadow-card`, `shadow-popover`, `shadow-subtle` |
| `bg-[var(--some-token)]` | the mapped utility (`bg-panel`) |
| `duration-100`, `duration-200`, `ease-linear` | `duration-fast`, `duration-slow`, `ease-sidebar` (default 150ms needs no class) |
| `text-[0.7rem] uppercase ...` | `label-overline` |
| A second icon library | `@tabler/icons-react` only |

Opacity modifiers on tokens are fine: `bg-destructive/10`, `ring-foreground/10`.

Only exception in the kit: card network marks (Visa, Mastercard) in the billing
demo use the networks' own brand colours.

## 2. Colour: when to use which

### Surfaces (back to front)

| Utility | Token | Use for |
| --- | --- | --- |
| `bg-background` | `--background` | App shell base, page behind everything |
| `bg-sidebar` | `--sidebar` | Navigation surfaces (side nav, stacked layout shell) |
| `bg-rail` + `text-rail-foreground` | `--rail` | The icon rail. Dark in light and dark mode |
| `bg-panel` or `surface-panel` | `--panel` | The layout's content panel. `surface-panel` adds the hairline ring |
| `bg-card` | `--card` | Cards. Use the `Card` component, not the class |
| `bg-popover` | `--popover` | Menus, selects, sheets, anything floating above the page |
| `bg-muted` | `--muted` | Quiet fills: hover states, tabs list, skeletons, avatar fallback |

Add `surface-gradient` on top of panel, card and sidebar surfaces. `Card`
already includes it.

### Text

| Utility | Use for |
| --- | --- |
| `text-foreground` | Titles, values, primary text |
| `text-muted-foreground` | Descriptions, captions, placeholders, inactive nav |
| `text-primary-foreground` | Text on `bg-primary` |
| `text-destructive`, `text-success`, `text-warning` | Status text |

### Fills and actions

| Token pair | Use for |
| --- | --- |
| `primary` / `primary-foreground` | Strong neutral fill: default Badge, checked Checkbox and Radio, Logo mark |
| `raised` / `raised-border` | The raised button surface (Button default). Pair with `shadow-raised` |
| `solid` / `solid-foreground` | Flat dark fill (Button secondary, used for Cancel) |
| `recessed` / `recessed-border` | Text field surface. Pair with `shadow-recessed` |
| `secondary`, `accent` + their `-foreground` | shadcn defaults: secondary Badge, focused menu item |
| `switch-track`, `switch-track-checked`, `switch-thumb` | Switch only |

### Status

| Meaning | Solid | Tint (preferred for badges and alerts) |
| --- | --- | --- |
| Error, danger | `bg-destructive` | `bg-destructive/10 text-destructive` (border `border-destructive/30`) |
| Success | `bg-success` | `bg-success/15 text-success` |
| Warning | `bg-warning` | `bg-warning/15 text-warning` |

Use `<Badge variant="success | warning | destructive">` and
`<Alert variant="destructive | success | warning">` instead of composing tints.
All form and auth errors use `<Alert variant="destructive">`.

### Accents

There are no decorative accent colours. Icon tiles are monochrome:
`<IconTile>` (muted), `tone="outline"` or `tone="primary"`. If a product needs
an accent, add a token in `src/theme.css` first, then a tone on `IconTile`.
Never use a palette class.

### Lines

| Utility | Use for |
| --- | --- |
| `border-border` | Default border (already the base border colour) |
| `border-input` | Checkbox, Radio, outline Button in dark |
| `ring-ring/50` + `border-ring` | Focus. Every control: `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50` |
| `ring-1 ring-foreground/10` | Hairline around panels and popovers |
| `<Separator />` | Flat divider between list rows |
| `<Separator variant="etched" />` | Engraved divider between major regions (uses `--etched-line` + `--etched-edge`) |

## 3. Shadows and effects

| Utility | Use for |
| --- | --- |
| `shadow-raised` | Raised controls: default Button, active item in the stacked nav |
| `shadow-recessed` | Text fields: Input, Select trigger, Textarea, InputGroup |
| `shadow-card` | Cards |
| `shadow-popover` | Menus, select popups, sheets |
| `shadow-subtle` | Small lift: checkbox, active sidebar item, active tab, floating layout panel. It is `none` in dark |
| `shadow-etched-h`, `shadow-etched-v` | The light edge under (horizontal) or beside (vertical) an etched line: `<Separator variant="etched" />`, the sidebar's etched edge |
| `shadow-sidebar-ring`, `shadow-sidebar-ring-hover` | One-pixel outline on the `outline` sidebar menu button, at rest and on hover |
| `surface-gradient` | Soft top-to-bottom sheen on panel, card, sidebar |
| `glow` (or `<Card glow>`) | Diagonal corner glow ring. Opt in, use sparingly. Tune with `--glow-angle`, `--glow-count`, `--glow-width` |

Rule of thumb: things you press are **raised**, things you type into are
**recessed**, containers **float** (`shadow-card`).

## 4. Typography

One family: `font-sans` (`--font-family`). Titles use `font-heading`
(`--font-family-heading`, same font by default). Use the named styles:

| Class | Size / line | Weight | Use for |
| --- | --- | --- | --- |
| `title-display` | 24 / 32, tight | 600 | Auth screens, marketing-style headings |
| `title-page` | 24 / 32, tight | 700 | The one title of a page |
| `title-section` | 16 / 24 | 700 | A section inside a page |
| `title-row` | 14 / 20 | 600 | Title of a row, list item or small card |
| `text-sm font-medium` | 14 / 20 | 500 | Labels, buttons |
| `text-sm` (+ `text-muted-foreground`) | 14 / 20 | 400 | Body and descriptions |
| `text-xs` | 12 / 16 | 400 | Captions, helper text |
| `label-overline` | 11.2 / 16, uppercase | 500 | Group labels, table headers (TableHead has it built in) |

Do not set heading sizes by hand (`text-lg font-bold`). Headings have no default
size in Tailwind, so an `h3` with no class renders as body text.

## 5. Spacing and sizes

Tailwind's 4px grid, no custom spacing tokens.

| Where | Value |
| --- | --- |
| Icon to label inside a control | `gap-1.5` (6px) |
| Label to field | `gap-1.5` (6px) |
| Between fields, between row items | `gap-4` (16px) |
| Inside a section | `gap-5` (20px) |
| Between sections | `gap-8` (32px) |
| Card padding | 24px (`size="sm"`: 16px) |
| Page gutter | `px-4 sm:px-6 md:px-8` (from `PAGE_CONTAINER_GUTTER_X`) |
| Header height / content max width | 64px / `max-w-[90rem]` |

### Control sizes

| Size | Height | Notes |
| --- | --- | --- |
| `xs` | 24px | Dense toolbars |
| `sm` | 32px | Inline actions, table rows |
| default | **40px** | Button, Input, Select, InputGroup. Use this unless you have a reason |
| `lg` | 44px | Prominent call to action |

Do not pass `size="lg"` to get the normal size. Do not override heights with
`h-*` classes. Icons: 16px inside controls, 20px in navigation, Tabler stroke
1.5 in nav.

### Radius

One token, `--radius` (10px). Scale: `rounded-sm` 6 (menu items), `rounded-md` 8
(controls), `rounded-lg` 10 (tiles, menus), `rounded-xl` 14 (cards),
`rounded-2xl` 18 (shell panels), `rounded-4xl` (badges), `rounded-full`
(switch, avatar).

## 6. Motion

| Token | Value | Utility | Use for |
| --- | --- | --- | --- |
| `--duration-base` | 150ms | none (default of every `transition-*`) | Hover, focus, colour |
| `--duration-fast` | 100ms | `duration-fast` | Menus, selects, tooltips opening |
| `--duration-slow` | 200ms | `duration-slow` | Sidebar, sheet, chevrons |
| `--ease-standard` | cubic-bezier(0.4, 0, 0.2, 1) | none (default) | Everything |
| `--ease-sidebar` | linear | `ease-sidebar` | Sidebar width |

## 7. Components to reach for

Before writing markup, check `src/components` (the `Logo` is rebuilt in card 1.5):

- A settings line with icon, title, description and an action: `SettingRow`
- An icon square: `IconTile`
- A search field: `InputGroup` + `InputGroupAddon` + `InputGroupInput`
- Label + field + help or error: `Field`, `FieldLabel`, `FieldDescription`, `FieldError`
- An error or notice box: `Alert`
- The brand mark: `Logo` (name comes from `app.config`, never hardcode it)

## 8. Dark mode and forced modes

- Dark mode is the `dark` class on `<html>` (set by `ThemeProvider`).
- `dark:` utilities are allowed only to switch between two tokens
  (`dark:bg-input/30`). Never use `dark:` to introduce a raw colour.
- `.dark` or `.force-light` on any element forces that mode for its subtree
  (the preview page uses this).

## 9. Checklist: adding a new shadcn component so it matches

1. Add it with `shadcn` into `packages/ts/ui/src/components`, and export it from
   `src/index.ts`.
2. Open the new file and replace, wherever they appear:
   - `shadow-xs` / `shadow-sm` with `shadow-subtle`
   - `shadow-md` / `shadow-lg` / `shadow-xl` on floating content with `shadow-popover`
   - `duration-100` with `duration-fast`; `duration-200` or longer with `duration-slow`
   - `bg-black/…` or `bg-white/…` overlays with a token tint (`bg-foreground/10`)
   - any palette class or hex with a token from section 2
3. If it is a text field, give it the recessed look:
   `border-recessed-border bg-recessed shadow-recessed`, and remove `dark:bg-input/30`.
4. If it is a pressable surface, use `Button` or `buttonVariants`. Do not restyle.
5. If it is a container, use `Card` or `bg-card surface-gradient shadow-card`.
6. Default control height is 40px (`h-10`); `sm` 32px; `lg` 44px.
7. Replace any `lucide-react` import with the `@tabler/icons-react` equivalent.
8. Add it to the dev-only preview route in the web app (card 1.3) with all
   variants and states.
9. Search the file for `#`, `rgb`, `oklch`, `shadow-[`, `duration-` and palette
   names. There should be none.
10. Run `scripts/verify.sh`.

## 10. Checklist: adding a new theme

1. Open `src/theme.css`, section 7 ("ADD A THEME HERE"). Copy the two blocks
   and rename `name`.
2. In the light block, set every token from section 3 of the file. In the dark
   block, set every token from section 4. Tokens you leave out fall back to the
   default theme.
3. Do not touch any component or page file. If the theme cannot be expressed,
   a token is missing: add the token (step 6), do not hardcode.
4. Activate it: `<html data-theme="name">` (plus the `dark` class for dark).
5. Open `/components` and check both panels. Look especially at: text on
   every fill (`*-foreground` pairs), the active sidebar item, the rail, focus
   rings, disabled states, switch on and off.
6. Adding a token (rare): add its value in sections 3 and 4, map it in
   section 2 (`--color-x: var(--x)` or `--shadow-x: var(--x-shadow)`). For a new
   shadow, font, duration or easing name, also register it in
   `src/cn.ts` so `tailwind-merge` resolves conflicts.

## 11. Token reference

Full list with values: `src/theme.css`. Groups:

- Fonts and radius: `--font-family`, `--font-family-heading`, `--radius`
- Motion: `--duration-fast|base|slow`, `--ease-standard`, `--ease-sidebar`
- Surfaces: `--background`, `--panel`, `--card`, `--popover`, `--sidebar`, `--rail`, `--surface-gradient`
- Text: `--foreground`, `--muted-foreground`, and one `-foreground` per surface or fill
- Fills: `--primary`, `--secondary`, `--muted`, `--accent`, `--raised`, `--recessed`, `--solid`, switch tokens
- Status: `--destructive`, `--success`, `--warning`
- Lines: `--border`, `--input`, `--ring`, sidebar border and ring, `--etched-line`, `--etched-edge`, `--glow`
- Shadows: `--raised-shadow`, `--recessed-shadow`, `--card-shadow`, `--popover-shadow`, `--subtle-shadow`, three switch shadows, `--etched-h-shadow`, `--etched-v-shadow`, `--sidebar-ring-shadow`, `--sidebar-ring-hover-shadow`
