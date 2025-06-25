/// <reference types="node" />

import alchemy from "alchemy";
import { Vite } from "alchemy/cloudflare";

const app = await alchemy("cloudflare-vite", {
	phase: process.argv.includes("--destroy") ? "destroy" : "up",
});

export const website = await Vite("vite-website", {
	name: "readit",
	main: "./worker/index.ts",
	command: "bun run build",
	compatibilityFlags: ["nodejs_compat"],
});

console.log({
	url: website.url,
});

await app.finalize();
