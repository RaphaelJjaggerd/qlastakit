import { createApp } from "./app";

const port = Number(process.env.API_PORT ?? 8787);

const app = await createApp();
await app.listen(port);
console.log(`api listening on http://localhost:${port}`);
