// Token-purity check (PRD 3.5, card 1.4): UI code and web app code carry no hardcoded
// color, shadow, gradient or surface. Everything comes from a semantic token defined in
// packages/ts/ui/src/theme.css (the one file skipped, because token values belong there).
// Exits 1 and lists every hit.
//   node scripts/check-tokens.mjs            check the repo, then the fixtures
//   node scripts/check-tokens.mjs <paths..>  check these files or folders (probes)
// Fixtures: scripts/fixtures/tokens/banned.txt and banned.css hold one banned form per
// line and every line must be reported; allowed.txt must pass. Add a form there with
// every rule change.
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
];

const SKIP = /\.(?:test|spec)\.[cm]?[tj]sx?$/;
const EXT = /\.(?:[cm]?[tj]sx?|css|txt)$/;
const SKIP_NAMES = new Set(["node_modules", "routeTree.gen.ts", "theme.css"]);

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
function scan(roots) {
  const hits = [];
  for (const root of roots) {
    for (const file of files(root)) {
      if (!EXT.test(file) || SKIP.test(file) || SKIP_NAMES.has(basename(file))) continue;
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, i) => {
          for (const [name, re] of RULES) {
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
  const hits = scan(process.argv.slice(2));
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
  const hit = new Set(scan([file]).map((h) => Number(h.split(":")[1])));
  lines.forEach((line, i) => {
    if (line.trim() && !hit.has(i + 1))
      problems.push(`${file}:${i + 1}: not caught: ${line.trim()}`);
  });
}
for (const h of scan([`${dir}/allowed.txt`, `${dir}/allowed.css`]))
  problems.push(`wrongly flagged: ${h}`);
if (problems.length > 0) fail("tokens: FAILED, the check's own fixtures:", problems);

console.log("tokens: no hardcoded color, shadow or surface");
