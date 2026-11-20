// Token-purity check (PRD 3.5, card 1.4): UI components and web app code carry no
// hardcoded color, shadow, gradient or surface. Everything comes from a semantic token
// defined in packages/ts/ui/src/theme.css. Exits 1 and lists every hit.
//   node scripts/check-tokens.mjs            check the repo
//   node scripts/check-tokens.mjs <paths..>  check these files or folders (probes)
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const roots =
  process.argv.length > 2
    ? process.argv.slice(2)
    : ["packages/ts/ui/src/components", "apps/web/src"];

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const PROPS =
  "bg|text|border|ring|fill|stroke|outline|divide|from|to|via|shadow|accent|caret|decoration|placeholder";

const RULES = [
  ["hex color", /#[0-9a-fA-F]{3,8}\b/],
  ["color function", /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb|color-mix)\(/],
  ["palette color", new RegExp(`\\b(?:${PROPS})-(?:white|black|(?:${PALETTE})-\\d+)\\b`)],
  ["arbitrary color", new RegExp(`\\b(?:${PROPS})-\\[(?:#|rgba?|hsla?|oklch|color)`)],
  ["bare white or black", /\b(?:bg|text|border)-(?:white|black)\b/],
  [
    "stock shadow",
    /(?:^|[\s"'`:])shadow(?:-(?:2xs|xs|sm|md|lg|xl|2xl|inner|\[[^\]]*\]))?(?=[\s"'`]|$)/,
  ],
  ["other shadow", /\b(?:drop-shadow|inset-shadow|text-shadow)\b/],
  ["gradient", /\bbg-(?:linear|gradient|radial|conic)/],
];

const SKIP = /\.(?:test|spec)\.[cm]?[tj]sx?$/;
const EXT = /\.[cm]?[tj]sx?$/;

function* files(path) {
  if (statSync(path).isFile()) {
    yield path;
    return;
  }
  for (const name of readdirSync(path)) {
    if (name === "node_modules" || name === "routeTree.gen.ts") continue;
    yield* files(join(path, name));
  }
}

const hits = [];
for (const root of roots) {
  for (const file of files(root)) {
    if (!EXT.test(file) || SKIP.test(file)) continue;
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

if (hits.length > 0) {
  console.log("tokens: FAILED, hardcoded color, shadow or surface (use a token from theme.css):");
  console.log(hits.join("\n"));
  process.exit(1);
}
console.log("tokens: no hardcoded color, shadow or surface");
