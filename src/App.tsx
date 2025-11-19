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
				// Try to get error message from json
				try {
					const errData = await res.json();
					throw new Error(errData.error || "Failed to fetch article");
				} catch (err) {
					throw new Error(err instanceof Error ? err.message : "Unknown error");
				}
			}
			const data = await res.json();
			setArticle(data);
		} catch (e: unknown) {
			if (e instanceof Error) {
				setError(e.message);
			} else {
				setError("Unknown error");
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
