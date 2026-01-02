# ReadIt

A clean, distraction-free web article reader powered by Mozilla's Readability library. ReadIt extracts the main content from any web page and presents it in a beautiful, easy-to-read format.

## Features

- **Clean Reading Experience**: Removes ads, sidebars, and distractions to focus on the content
- **Dual Access Modes**: Use the web interface or direct URL parsing
- **Dark Mode Support**: Automatically adapts to your system preferences
- **Fast & Lightweight**: Built on Cloudflare Workers for global edge performance
- **No Backend Database**: Stateless architecture - just provide a URL and read

## Architecture

ReadIt consists of:

- **Frontend**: React 19 + Vite application with a simple URL input interface
- **Backend**: Cloudflare Workers using the Hono framework
- **Parser**: Mozilla Readability for content extraction
- **Deployment**: Single Cloudflare Pages application

## Usage

### Web Interface

1. Visit the deployed application
2. Enter any article URL (e.g., `example.com/article`)
3. Click "Read" to view the cleaned content

### Direct URL Access

You can also access articles directly by visiting:

```
https://your-app.pages.dev/example.com/article
```

This will immediately render the parsed article without using the web interface.

### API Endpoint

The application exposes a JSON API:

```
GET /api/read?url=https://example.com/article
```

Returns a JSON object with:
- `title`: Article title
- `byline`: Author information (if available)
- `content`: HTML content
- `textContent`: Plain text content
- `excerpt`: Article summary

## Development

### Prerequisites

- [Bun](https://bun.sh) (or Node.js)
- Cloudflare account (for deployment)

### Setup

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

### Code Quality

```bash
# Run ESLint
bun run lint

# Run Biome formatter/linter
bunx biome check .

# Auto-fix formatting issues
bunx biome check . --apply
```

### Deployment

```bash
# Deploy to Cloudflare Pages
bun run deploy
```

## Project Structure

```
readit/
├── src/              # React frontend
│   ├── App.tsx       # Main application component
│   ├── main.tsx      # Application entry point
│   └── *.css         # Styles
├── worker/           # Cloudflare Worker
│   ├── index.ts      # Worker entry point & API routes
│   └── env.ts        # Environment type definitions
├── dist/client/      # Built frontend assets (after build)
├── wrangler.jsonc    # Cloudflare Worker configuration
└── alchemy.run.ts    # Infrastructure as code
```

## Configuration

### TypeScript

The project uses TypeScript project references:
- `tsconfig.app.json`: Frontend configuration
- `tsconfig.worker.json`: Worker configuration
- `tsconfig.json`: Root configuration

### Cloudflare Worker

Worker configuration in `wrangler.jsonc`:
- Node.js compatibility enabled (for linkedom)
- Assets binding for serving frontend

## Tech Stack

- **Frontend**: React 19, Vite, TypeScript
- **Backend**: Cloudflare Workers, Hono
- **Parser**: @mozilla/readability, linkedom
- **Code Quality**: Biome, ESLint, TypeScript
- **Deployment**: Cloudflare Pages, Alchemy

## License

This project is private and not currently licensed for public use.

## Contributing

This is a personal project. If you'd like to suggest improvements, please open an issue first to discuss proposed changes.
