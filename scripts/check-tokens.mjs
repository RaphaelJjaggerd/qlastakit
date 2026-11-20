// Token-purity check (PRD 3.5, card 1.4): UI code and web app code carry no hardcoded
// color, shadow, gradient or surface. Everything comes from a semantic token defined in
// packages/ts/ui/src/theme.css (its token blocks are skipped, because token values belong
// there; its helper section, from the first `@utility` on, is scanned).
// Exits 1 and lists every hit.
//   node scripts/check-tokens.mjs            check the repo, then the fixtures
//   node scripts/check-tokens.mjs <paths..>  check these files or folders (probes)
// Fixtures: scripts/fixtures/tokens/banned.txt and banned.css hold one banned form per
// line and every line must be reported; allowed.txt and allowed.css must pass. Add a form
// there with every rule change.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const PROPS =
  "bg|text|border|ring|fill|stroke|outline|divide|from|to|via|shadow|accent|caret|decoration|placeholder";
// Side or offset part between the property and the color: border-t-, border-e-,
// border-x-, ring-offset-, inset-ring- ...
const PART = "(?:(?:[xytblrse]|offset|inset)-)?";
const NAMED = `white|black|${PALETTE}`;

// Named CSS colors in plain declarations (color: red; border: 1px solid black).
const CSS_NAMED = `white|black|gray|grey|silver|maroon|olive|navy|aqua|gold|brown|tan|coral|crimson|salmon|khaki|ivory|beige|lavender|magenta|turquoise|${PALETTE}`;
const CSS_PROP =
  "[\\w-]*color|background(?:-image)?|border(?:-[a-z-]+)?|outline|fill|stroke|box-shadow|text-shadow|filter|text-decoration";

const RULES = [
  ["hex color", /#[0-9a-fA-F]{3,8}\b/],
  ["color function", /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb|color-mix)\(/],
  ["palette color", new RegExp(`\\b(?:${PROPS})-${PART}(?:white|black|(?:${PALETTE})-\\d+)\\b`)],
  ["palette variable", new RegExp(`--color-(?:${PALETTE})-\\d`)],
  [
    "arbitrary color",
    new RegExp(`\\b(?:${PROPS})-${PART}\\[(?:#|rgba?|hsla?|oklch|color|(?:${NAMED})\\])`),
  ],
  ["bare white or black", new RegExp(`\\b(?:bg|text|border)-${PART}(?:white|black)\\b`)],
  [
    "stock shadow",
    /(?:^|[\s"'`:!])shadow(?:-(?:2xs|xs|sm|md|lg|xl|2xl|inner|\[[^\]]*\]))?(?:\/[^\s"'`;]+)?!?(?=[\s"'`;]|$)/,
  ],
  // `text-shadow:` as a CSS property is the "css shadow" rule; the class forms are here.
  ["other shadow", /\b(?:drop-shadow|inset-shadow|text-shadow(?!:))/],
  ["css shadow", /\b(?:box|text)-shadow:(?!\s*(?:none\b|var\())/],
  ["gradient", /\bbg-(?:linear|gradient|radial|conic)/],
  // Plain CSS only (third entry). One line per declaration; a value split over lines is not read.
  [
    "named color",
    new RegExp(
      `(?:^|[;{\\s])(?:${CSS_PROP})\\s*:[^;}]*?(?<![\\w-])(?:${CSS_NAMED})(?![\\w.(-])`,
      "i",
    ),
    "css",
  ],
];

// Helper section of theme.css (PRD 3.5): everything from the first `@utility` on is scanned;
// the token blocks above it are skipped. `linear-gradient(#000 0 0)` is the mask-alpha idiom
// (the color is never painted), so it is not a hardcoded color.
const THEME = "theme.css";
const THEME_HELPERS = /^@(?:utility|layer base)\b/;
const MASK_IDIOM = /linear-gradient\(#000 0 0\)/g;

const SKIP = /\.(?:test|spec)\.[cm]?[tj]sx?$/;
const REPO_EXT = /\.(?:[cm]?[tj]sx?|css)$/;
const FIXTURE_EXT = /\.(?:[cm]?[tj]sx?|css|txt)$/;
const SKIP_NAMES = new Set(["node_modules", "routeTree.gen.ts"]);

function* files(path) {
  if (statSync(path).isFile()) {
    yield path;
    return;
  }
  for (const name of readdirSync(path)) {
    if (SKIP_NAMES.has(name)) continue;
    yield* files(join(path, name));
  }
}

// Every hit in `roots`, as "file:line: rule: match".
// `.txt` is read only when `ext` is FIXTURE_EXT (fixtures and probes), never in the repo scan.
function scan(roots, ext = REPO_EXT) {
  const hits = [];
  for (const root of roots) {
    for (const file of files(root)) {
      if (!ext.test(file) || SKIP.test(file) || SKIP_NAMES.has(basename(file))) continue;
      const lines = readFileSync(file, "utf8").split("\n");
      const isCss = file.endsWith(".css");
      // theme.css: skip the token blocks, scan from the helper section on.
      let first = 0;
      if (basename(file) === THEME) {
        first = lines.findIndex((l) => THEME_HELPERS.test(l));
        if (first < 0) first = lines.length;
      }
      lines
        .map((line) => line.replace(MASK_IDIOM, ""))
        .forEach((line, i) => {
          if (i < first) return;
          // Full-line CSS comments are prose ("not a plain colour or shadow").
          if (isCss && /^\s*(?:\/\*|\*)/.test(line)) return;
          for (const [name, re, only] of RULES) {
            if (only === "css" && !isCss) continue;
            const m = re.exec(line);
            if (m) hits.push(`${file.replaceAll("\\", "/")}:${i + 1}: ${name}: ${m[0].trim()}`);
          }
        });
    }
  }
  return hits;
}

function fail(title, lines) {
  console.log(title);
  console.log(lines.join("\n"));
  process.exit(1);
}

if (process.argv.length > 2) {
  const hits = scan(process.argv.slice(2), FIXTURE_EXT);
  if (hits.length > 0) fail("tokens: FAILED", hits);
  console.log("tokens: clean");
  process.exit(0);
}

const hits = scan(["packages/ts/ui/src", "apps/web/src"]);
if (hits.length > 0) {
  fail("tokens: FAILED, hardcoded color, shadow or surface (use a token from theme.css):", hits);
}

// Self-test: the fixtures prove each banned form is still caught and each token form
// still passes, so a later regex edit cannot silently drop a form.
const dir = "scripts/fixtures/tokens";
const problems = [];
for (const name of ["banned.txt", "banned.css"]) {
  const file = `${dir}/${name}`;
  const lines = readFileSync(file, "utf8").split("\n");
  const hit = new Set(scan([file], FIXTURE_EXT).map((h) => Number(h.split(":")[1])));
  lines.forEach((line, i) => {
    if (line.trim() && !hit.has(i + 1))
      problems.push(`${file}:${i + 1}: not caught: ${line.trim()}`);
  });
}
for (const h of scan([`${dir}/allowed.txt`, `${dir}/allowed.css`], FIXTURE_EXT))
  problems.push(`wrongly flagged: ${h}`);
if (problems.length > 0) fail("tokens: FAILED, the check's own fixtures:", problems);

console.log("tokens: no hardcoded color, shadow or surface");
