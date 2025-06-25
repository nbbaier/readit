import { Hono } from "hono";
import type { CloudflareEnv } from "./env";

const app = new Hono<{ Bindings: CloudflareEnv }>();

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));
app.get("/hello", (c) => c.text("Hello World"));

export default app;
