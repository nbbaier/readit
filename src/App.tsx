import { type FormEvent, useState } from "react";
import "./App.css";

interface Article {
	title: string;
	byline: string;
	content: string;
	textContent: string;
	excerpt: string;
}

function App() {
	const [url, setUrl] = useState("");
	const [article, setArticle] = useState<Article | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!url) return;

		setLoading(true);
		setError(null);
		setArticle(null);

		// Clean up the URL input
		let targetUrl = url.trim();
		if (!targetUrl.startsWith("http")) {
			targetUrl = `https://${targetUrl}`;
		}

		try {
			const res = await fetch(`/api/read?url=${encodeURIComponent(targetUrl)}`);

			if (!res.ok) {
				// Try to get error message from JSON response
				let errorMessage = "Failed to fetch article";
				try {
					const errData = await res.json();
					errorMessage = errData.error || errorMessage;
				} catch {
					// Response wasn't JSON, use status-based message
					if (res.status === 400) {
						errorMessage = "Invalid URL provided";
					} else if (res.status === 422) {
						errorMessage = "Unable to parse article content from this URL";
					} else if (res.status === 500) {
						errorMessage = "Server error while fetching the article";
					} else {
						errorMessage = `Failed to fetch article (Error ${res.status})`;
					}
				}
				throw new Error(errorMessage);
			}

			const data = await res.json();
			setArticle(data);
		} catch (e: unknown) {
			if (e instanceof Error) {
				// Provide user-friendly messages for common errors
				if (e.name === "TypeError" && e.message.includes("fetch")) {
					setError("Network error: Unable to connect to the server");
				} else {
					setError(e.message);
				}
			} else {
				setError("An unexpected error occurred");
			}
		} finally {
			setLoading(false);
		}
	};

	if (article) {
		return (
			<div className="reader-view">
				<button
					type="button"
					className="back-button"
					onClick={() => setArticle(null)}
				>
					← Read another
				</button>
				<header>
					<h1>{article.title}</h1>
					{article.byline && <div className="byline">By {article.byline}</div>}
				</header>
				<div
					className="article-content"
					// Note: Content is sanitized by Mozilla Readability on the server
					// which removes script tags and other dangerous elements
					dangerouslySetInnerHTML={{ __html: article.content }}
				/>
			</div>
		);
	}

	return (
		<div className="container">
			<h1>ReadIt</h1>
			<p>Enter a URL to view it in distraction-free reader mode.</p>

			<form onSubmit={handleSubmit}>
				<input
					type="text"
					placeholder="example.com/article"
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					required
				/>
				<button type="submit" disabled={loading}>
					{loading ? "Loading..." : "Read"}
				</button>
			</form>

			{error && <div className="error">{error}</div>}
		</div>
	);
}

export default App;
