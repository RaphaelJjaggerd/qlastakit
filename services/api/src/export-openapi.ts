// Writes the OpenAPI spec to /contracts/openapi.json without listening or touching a
// database. Run via `mise run contract`. Never edit contracts/openapi.json by hand.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildSpec, createApp } from "./app";

const app = await createApp();
const spec = buildSpec(app);
await app.close();

const out = fileURLToPath(new URL("../../../contracts/openapi.json", import.meta.url));
writeFileSync(out, `${JSON.stringify(spec, null, 2)}\n`);
console.log(`wrote ${out}`);
