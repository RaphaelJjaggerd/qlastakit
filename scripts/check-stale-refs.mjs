// Stale-reference check (card 1.8): committed docs and config must not point at things
// that moved or went away. Two rules:
//   1. A backticked repo path in AGENTS.md, README.md, docs/recipes, agent guides
//      (**/AGENTS.md) and .claude/commands/*.md must exist. A path is a backticked token
//      that starts with a top-level repo name, or (in a guide below the root) a folder of
//      that guide's own directory such as `src/...`; `:12` or `:12-14` line suffixes
//      are ignored; tokens with a glob or placeholder (* < > { } [ ] $ ... NNNN) and
//      paths under gitignored folders (references/, Logs/, .potato/) are skipped.
//   2. `localhost:8787` not followed by `/api` in *.md, .env.example and *.toml.
// Exits 1 and lists every hit.
//   node scripts/check-stale-refs.mjs            check the committed files
//   node scripts/check-stale-refs.mjs <files..>  check these files (probes); rule 2 applies
//                                                 to every file given
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);

// Top-level names: the first segment of every tracked file (derived below), plus names a
// guide could misspell (a stale name is not a tracked file, so it cannot be derived).
const EXTRA_TOP = [
  "turbo.json",
  "pnpm-workspace.yaml",
  "vitest.config.ts",
  "playwright.config.mts",
  ".oxlintrc.json",
  ".oxfmtrc.json",
];
const IGNORED_FOLDERS = ["references/", "Logs/", ".potato/"];
// Paths the recipes tell the reader to create ("Example: a `projects` feature"), so they
// do not exist on purpose. Exact paths only; add one here when a recipe names a new one.
const EXAMPLES = new Set([
  "db/migrations/0002_projects.sql",
  "apps/web/src/routes/projects.tsx",
  "apps/web/src/routes/reports.tsx",
  "services/api-rs",
  "services/api-rs/",
  "services/api-go/",
  "services/api-py/",
]);
const PLACEHOLDER = /[*<>{}[\]$]|\.\.\.|NNNN/;

const args = process.argv.slice(2);
const tracked = (...patterns) =>
  execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", ...patterns], {
    encoding: "utf8",
  })
    .split("\n")
    .filter(Boolean);

const TOP = new Set([...tracked().map((f) => f.split("/")[0]), ...EXTRA_TOP]);
// A guide below the root writes paths relative to its own folder (`src/routes/...`):
// the first segments of the files under that folder.
const localTops = (dir) =>
  new Set(tracked(`${dir}/`).map((f) => f.slice(dir.length + 1).split("/")[0]));

const guides = args.length
  ? args
  : [
      ...new Set([
        ...tracked("AGENTS.md", "README.md", "docs/recipes/*.md", "**/AGENTS.md"),
        ...tracked(".claude/commands/*.md"),
      ]),
    ];
const urlFiles = args.length
  ? args
  : tracked("*.md", ".env.example", "*.toml").filter(
      // history and plan documents quote old URLs on purpose
      (f) =>
        !/^docs\/(TASKS|PRD|PRD_REVIEW|BRIEF|VISION)\.md$/.test(f) && !f.startsWith("docs/adr/"),
    );

const hits = [];

// A token is a repo path when its first segment is a top-level name (root-anchored) or a
// folder of the guide's own directory (guide-relative). It is stale when no reading exists.
const isStale = (path, dir, locals) => {
  const first = path.split("/")[0];
  const candidates = [];
  if (TOP.has(first)) candidates.push(path);
  if (dir !== "." && locals.has(first)) candidates.push(`${dir}/${path}`);
  if (!candidates.length) return false; // not a repo path
  return !candidates.some((c) => EXAMPLES.has(c) || existsSync(join(root, c)));
};

for (const file of guides) {
  const dir = dirname(file).replaceAll("\\", "/");
  const locals = dir === "." ? new Set() : localTops(dir);
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const [, token] of line.matchAll(/`([^`\s]+)`/g)) {
      const path = token.replace(/:\d+(?:-\d+)?$/, "");
      if (PLACEHOLDER.test(path)) continue;
      if (IGNORED_FOLDERS.some((f) => path.startsWith(f))) continue;
      if (isStale(path, dir, locals)) hits.push(`${file}:${i + 1}: \`${token}\` does not exist`);
    }
  });
}

for (const file of urlFiles) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, i) => {
      if (/localhost:8787(?!\/api(?:\/|\b))/.test(line)) {
        hits.push(`${file}:${i + 1}: localhost:8787 without /api`);
      }
    });
}

if (hits.length) {
  console.log("stale references:");
  for (const h of hits) console.log(`  ${h}`);
  process.exit(1);
}
console.log(`stale refs: ${guides.length} guides and ${urlFiles.length} files clean`);
