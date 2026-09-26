# ideal-web-architecture

My ideal web architecture: HTMX and web components running on Node.

## Stack

- **Node.js** — server (run with `--watch` for dev)
- **HTMX** — hypermedia-driven UI
- **EJS** — server-side templating

## Structure

```
app/
  server.ts        # Entry point
  helpers/         # Shared utilities
  render/          # Route handlers that produce HTML
  views/           # EJS templates
  notes/           # Markdown content
  public/          # Static assets (htmx.js)
index.html         # Standalone HTML5 page
```

## Dev

```sh
npm run build  # copies htmx.js from node_modules to app/public/
npm run dev    # starts server with file watching
```
