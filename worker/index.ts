import { Readability } from "@mozilla/readability";
import { Hono } from "hono";
import { parseHTML } from "linkedom";
import type { CloudflareEnv } from "./env";

// Define ASSETS if not properly typed inferred
type Bindings = CloudflareEnv & {
	ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Bindings }>();

async function parseUrl(url: string) {
	let targetUrl = url;
	if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
		targetUrl = `https://${targetUrl}`;
	}

	// Basic validation
	try {
		new URL(targetUrl);
	} catch (e: unknown) {
		if (e instanceof Error) {
			throw e;
		}
		return null;
	}

	// Add timeout to prevent hanging on slow websites
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

	let response: Response;
	try {
		response = await fetch(targetUrl, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (compatible; ReadIt/1.0; +https://github.com/nico-baier/readit)",
			},
			signal: controller.signal,
		});
	} catch (fetchError: unknown) {
		clearTimeout(timeoutId);
		if (fetchError instanceof Error && fetchError.name === "AbortError") {
			throw new Error("Request timeout: The website took too long to respond");
		}
		throw fetchError;
	} finally {
		clearTimeout(timeoutId);
	}

	if (!response.ok) {
		throw new Error(
			`Failed to fetch URL: ${response.status} ${response.statusText}`,
		);
	}

	const html = await response.text();
	const { document } = parseHTML(html);

	// Readability performs content sanitization, removing:
	// - Script tags and inline event handlers
	// - Iframes and embeds
	// - Forms and inputs
	// - Other potentially dangerous elements
	const reader = new Readability(document);
	const article = reader.parse();

	return article;
}

app.get("/api/read", async (c) => {
	const url = c.req.query("url");
	if (!url) return c.json({ error: "Missing url parameter" }, 400);

	try {
		const article = await parseUrl(url);
		if (!article) return c.json({ error: "Failed to parse article" }, 422);

		// Add caching headers - cache for 1 hour
		c.header("Cache-Control", "public, max-age=3600, s-maxage=3600");
		return c.json(article);
	} catch (e) {
		if (e instanceof Error) {
			return c.json({ error: e.message }, 500);
		}
		return c.json({ error: "Unknown error" }, 500);
	}
});

// Handle direct access
app.get("/*", async (c) => {
	const path = c.req.path.substring(1); // Remove leading slash

	const isStaticFile =
		/\.(png|jpg|jpeg|gif|svg|ico|js|css|json|map|txt)$/i.test(path);
	const looksLikeUrl =
		path.startsWith("http") || /^[a-zA-Z0-9-]+\.[a-z]{2,}/.test(path);

	if (
		path.length > 0 &&
		!path.startsWith("api/") &&
		!isStaticFile &&
		looksLikeUrl
	) {
		try {
			const article = await parseUrl(path);
			if (!article) {
				return c.text("Failed to parse content from URL", 422);
			}

			const html = `
             <!DOCTYPE html>
             <html lang="en">
             <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>${article.title} - ReadIt</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        line-height: 1.6;
                        max-width: 700px;
                        margin: 0 auto;
                        padding: 40px 20px;
                        color: #333;
                        background: #fff;
                    }
                    h1 { margin-top: 0; line-height: 1.2; }
                    a { color: #0066cc; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                    pre { background: #f4f4f4; padding: 15px; overflow-x: auto; border-radius: 4px; }
                    img { max-width: 100%; height: auto; border-radius: 4px; }
                    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; color: #666; }
                    .byline { color: #666; margin-bottom: 30px; font-style: italic; }
                    .content { font-size: 18px; }

                    /* Dark mode support */
                    @media (prefers-color-scheme: dark) {
                        body {
                            background-color: #111;
                            color: #e1e1e1;
                        }
                        a { color: #6b9cff; }
                        pre { background: #222; color: #e1e1e1; }
                        blockquote {
                            border-color: #444;
                            color: #aaa;
                        }
                        .byline { color: #aaa; }
                    }
                </style>
             </head>
             <body>
                <header>
                    <h1>${article.title}</h1>
                    ${article.byline ? `<div class="byline">By ${article.byline}</div>` : ""}
                </header>
                <main class="content">
                    ${article.content}
                </main>
             </body>
             </html>
             `;
			// Add caching headers - cache for 1 hour
			c.header("Cache-Control", "public, max-age=3600, s-maxage=3600");
			return c.html(html);
		} catch (e) {
			if (e instanceof Error) {
				return c.text(`Error fetching ${path}: ${e.message}`, 500);
			}
			return c.text(`Error fetching ${path}: Unknown error`, 500);
		}
	}

	// Fallback to static assets for root, assets, etc.
	return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
