// Writes the OpenAPI spec to /contracts/openapi.json without starting a server.
// Run via `just contract`. Never edit contracts/openapi.json by hand.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createApp } from "./app";

const spec = createApp().getOpenAPI31Document({
  openapi: "3.1.0",
  info: { title: "API", version: "0.1.0" },
});

const out = fileURLToPath(new URL("../../../contracts/openapi.json", import.meta.url));
writeFileSync(out, `${JSON.stringify(spec, null, 2)}\n`);
console.log(`wrote ${out}`);
