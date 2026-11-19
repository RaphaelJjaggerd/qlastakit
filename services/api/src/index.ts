import { createApp } from "./app";
import { loadEnv } from "./env";

const env = loadEnv();
const app = await createApp({ env });
await app.listen(env.API_PORT);
console.log(`api listening on http://localhost:${env.API_PORT}`);
